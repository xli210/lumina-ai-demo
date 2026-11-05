import unittest

import capacity_alert as ca


def health(q=0, running=0, init=0, idle=0, throttled=0, unhealthy=0):
    return {"jobs": {"inQueue": q}, "workers": {"running": running, "initializing": init, "idle": idle, "throttled": throttled, "unhealthy": unhealthy}}


class Judge(unittest.TestCase):
    def test_all_workers_busy_and_somebody_waits_is_critical(self):
        self.assertEqual(ca.judge_endpoint(health(q=1, running=3), 3)[0], ca.CRIT)

    def test_a_worker_that_is_starting_counts_as_busy(self):
        self.assertEqual(ca.judge_endpoint(health(q=1, running=2, init=1), 3)[0], ca.CRIT)

    def test_one_job_waiting_while_a_worker_is_free_is_fine(self):
        self.assertEqual(ca.judge_endpoint(health(q=1, running=1, idle=1), 3)[0], ca.OK)

    def test_queue_and_no_worker_able_to_start_is_critical(self):
        self.assertEqual(ca.judge_endpoint(health(q=1, throttled=3), 3)[0], ca.CRIT)

    def test_all_busy_without_a_queue_is_a_warning(self):
        self.assertEqual(ca.judge_endpoint(health(running=1), 1)[0], ca.WARN)

    def test_a_long_queue_is_reported_at_once(self):
        self.assertTrue(ca.judge_endpoint(health(q=3, running=3), 3)[2])

    def test_idle_endpoint_is_ok(self):
        self.assertEqual(ca.judge_endpoint(health(idle=3), 3)[0], ca.OK)

    def test_the_studio_line(self):
        self.assertEqual(ca.judge_studio({"queue": {"waiting": 0, "wait_s": 0}})[0], ca.OK)
        self.assertEqual(ca.judge_studio({"queue": {"waiting": 2, "wait_s": 400}})[0], ca.WARN)
        self.assertEqual(ca.judge_studio({"queue": {"waiting": 9, "wait_s": 1200}})[0], ca.CRIT)


class Evaluate(unittest.TestCase):
    BAD = {"E": (ca.CRIT, "all 3 workers are busy and 1 job(s) wait", False)}
    GOOD = {"E": (ca.OK, "0 of 3 workers busy, 0 waiting", False)}

    def test_one_bad_reading_is_not_mailed_but_the_second_is(self):
        mails, st = ca.evaluate(self.BAD, {}, 1000)
        self.assertEqual(mails, [])
        mails, st = ca.evaluate(self.BAD, st, 1300)
        self.assertEqual(len(mails), 1)
        self.assertIn("CRITICAL", mails[0][0])

    def test_an_immediate_reading_is_mailed_at_once(self):
        mails, _ = ca.evaluate({"E": (ca.CRIT, "x", True)}, {}, 1000)
        self.assertEqual(len(mails), 1)

    def test_the_same_level_is_repeated_only_every_half_hour(self):
        _, st = ca.evaluate(self.BAD, {}, 1000)
        _, st = ca.evaluate(self.BAD, st, 1300)
        mails, st = ca.evaluate(self.BAD, st, 1600)
        self.assertEqual(mails, [])
        mails, st = ca.evaluate(self.BAD, st, 1300 + ca.REPEAT_S)
        self.assertEqual(len(mails), 1)

    def test_a_worse_level_is_mailed_at_once_after_a_warning(self):
        warn = {"E": (ca.WARN, "w", False)}
        _, st = ca.evaluate(warn, {}, 1000)
        mails, st = ca.evaluate(warn, st, 1300)
        self.assertEqual(len(mails), 1)
        mails, st = ca.evaluate(self.BAD, st, 1600)
        self.assertEqual(len(mails), 1, "the warning was already mailed; the worse level does not wait for 30 minutes")

    def test_back_to_normal_is_mailed_once(self):
        _, st = ca.evaluate(self.BAD, {}, 1000)
        _, st = ca.evaluate(self.BAD, st, 1300)
        mails, st = ca.evaluate(self.GOOD, st, 1600)
        self.assertEqual(len(mails), 1)
        self.assertIn("back to normal", mails[0][0])
        mails, _ = ca.evaluate(self.GOOD, st, 1900)
        self.assertEqual(mails, [])

    def test_a_reading_that_was_never_bad_for_two_checks_is_silent_when_it_clears(self):
        _, st = ca.evaluate(self.BAD, {}, 1000)
        mails, _ = ca.evaluate(self.GOOD, st, 1300)
        self.assertEqual(mails, [])


class ReadAll(unittest.TestCase):
    def test_a_service_that_cannot_be_asked_is_not_reported_as_fine(self):
        def fetch(url, headers, timeout=20):
            raise OSError("down")
        out = ca.read_all({"RUNPOD_API_KEY": "k", "STUDIO_ACCESS_TOKEN": "t"}, fetch)
        self.assertTrue(all(v[0] != ca.OK for v in out.values()))
        self.assertEqual(out["Video studio line"][0], ca.CRIT)

    def test_reads_the_worker_limit_from_runpod(self):
        def fetch(url, headers, timeout=20):
            if "health" in url and "runpod.ai" in url:
                return health(q=1, running=2)
            if "rest.runpod.io" in url:
                return {"workersMax": 2}
            return {"queue": {"waiting": 0, "wait_s": 0}}
        out = ca.read_all({"RUNPOD_API_KEY": "k", "STUDIO_ACCESS_TOKEN": "t"}, fetch)
        self.assertEqual(out["Video FaceSwap (swap-review)"][0], ca.CRIT)


if __name__ == "__main__":
    unittest.main()
