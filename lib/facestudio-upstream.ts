/**
 * What the Face Studio routes tell the browser when the gateway is not
 * answering properly. Pure, so each case can be tested without a network.
 *
 * Before this existed, anything the gateway sent that was not JSON was passed
 * to the page as text. When Render suspended the service the page showed:
 *
 *   Detection failed: <!DOCTYPE html> <html lang="en"> ... Service Suspended ...
 *
 * Now a response that is not a JSON object, or that is a 5xx with no error of
 * the gateway's own, becomes the gateway's usual error shape with a code the
 * console already knows how to word ("gateway_unavailable").
 */

export const GATEWAY_UNAVAILABLE_MESSAGE =
  "Face Studio is temporarily unavailable. Please try again in a few minutes.";

export interface NormalizedUpstream {
  status: number;
  body: Record<string, unknown>;
}

function unavailable(status: number): NormalizedUpstream {
  return {
    // Keep a 5xx as it was (the console treats it as retryable); anything else
    // that arrived as a web page is still the server's fault.
    status: status >= 500 ? status : 502,
    body: {
      state: "error",
      error_code: "gateway_unavailable",
      error_kind: "server",
      error_message: GATEWAY_UNAVAILABLE_MESSAGE,
      retryable: true,
      detail: GATEWAY_UNAVAILABLE_MESSAGE,
    },
  };
}

export function normalizeUpstream(status: number, text: string): NormalizedUpstream {
  if (!text) {
    return status >= 500 ? unavailable(status) : { status, body: {} };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }

  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    const body = parsed as Record<string, unknown>;
    // A 5xx that carries none of the gateway's own error fields came from
    // something in front of it, so word it the same way.
    if (status >= 500 && typeof body.error_code !== "string") return unavailable(status);
    return { status, body };
  }

  // Not JSON: a web page (Render's suspended, cold-start or error page) or plain text.
  if (status >= 500 || /^\s*</.test(text)) return unavailable(status);
  return { status, body: { detail: text.slice(0, 400) } };
}
