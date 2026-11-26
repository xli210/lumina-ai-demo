/**
 * Words for the parts of /credits that say what credits buy: the "what this pack makes" line on each
 * pack, and the box for an account that has never bought credits listing what the first top-up
 * changes. Numbers are filled in by the page from the real prices, so a translation cannot state a
 * wrong one. Billing wording (prices, Black Friday dates) stays in English like the rest of the page.
 *
 * Every claim in `firstTopUp` is a rule the tools enforce for accounts that have bought credits:
 * the watermark (lib/facestudio-watermark.ts, the image edit route, the studios) and, in Nano FaceStudio Online, the
 * full-resolution photo without the small corner mark (free photos are capped at FREE_PHOTO_MAX_SIDE), the video lengths,
 * the queue and how long videos are kept (lib/facestudio-v.ts FAQ, enforced by the studio), and the
 * Face Studio render cap (app/api/facestudio/generate/route.ts).
 */
import type { AppLocale } from "@/lib/i18n/locales";

export interface CreditsPageCopy {
  /** {videos} {photos} */
  packUses: string;
  firstTopUp: {
    title: string;
    /** Each item may use {fullSeconds} {freeSeconds} {headSeconds} {freeHeadSeconds}. */
    items: string[];
    /** {member} {regular}: shown only while the members' face swap price runs. */
    blackFriday: string;
  };
}

const en: CreditsPageCopy = {
  packUses: "About {videos} ten-second Fast videos, or {photos} head swap photos",
  firstTopUp: {
    title: "Your first top-up, with any pack, also unlocks:",
    items: [
      "No watermark on your videos, head swaps and photo edits, and face swap photos at full resolution without the small corner mark",
      "Videos up to {fullSeconds} seconds (now {freeSeconds}), and head swap videos up to {headSeconds} seconds (now {freeHeadSeconds})",
      "A place at the front of the video line",
      "Finished videos kept for 7 days instead of 24 hours",
    ],
    blackFriday: "Photo face swaps for {member} credits instead of {regular}",
  },
};

const zhCN: CreditsPageCopy = {
  packUses: "约可做 {videos} 个 10 秒 Fast 视频，或 {photos} 张换头照片",
  firstTopUp: {
    title: "首次充值（任意套餐）还会解锁：",
    items: [
      "视频、换头和照片编辑不再有水印，换脸照片输出原图分辨率，也不再有角落的小标志",
      "视频最长 {fullSeconds} 秒（现在 {freeSeconds} 秒），换头视频最长 {headSeconds} 秒（现在 {freeHeadSeconds} 秒）",
      "视频优先排队",
      "做好的视频保留 7 天，而不是 24 小时",
    ],
    blackFriday: "照片换脸只需 {member} 积分，原价 {regular}",
  },
};

const ja: CreditsPageCopy = {
  packUses: "10 秒の Fast 動画なら約 {videos} 本、ヘッドスワップ写真なら {photos} 枚",
  firstTopUp: {
    title: "初めてのチャージで（どのパックでも）次のことも可能になります：",
    items: [
      "動画・ヘッドスワップ・写真編集のウォーターマークがなくなり、顔交換の写真はフル解像度で、隅の小さなマークもなくなります",
      "動画は最長 {fullSeconds} 秒（現在 {freeSeconds} 秒）、ヘッドスワップ動画は最長 {headSeconds} 秒（現在 {freeHeadSeconds} 秒）",
      "動画の順番待ちで優先されます",
      "完成した動画を 24 時間ではなく 7 日間保存",
    ],
    blackFriday: "写真の顔交換が {regular} クレジットではなく {member} クレジット",
  },
};

const ko: CreditsPageCopy = {
  packUses: "10초 Fast 동영상 약 {videos}개, 또는 헤드 스왑 사진 {photos}장",
  firstTopUp: {
    title: "첫 충전(어떤 팩이든)으로 함께 열리는 것:",
    items: [
      "동영상, 헤드 스왑, 사진 편집에 워터마크가 붙지 않고, 얼굴 교체 사진은 모서리의 작은 마크 없이 원본 해상도로 나옵니다",
      "동영상 최대 {fullSeconds}초(현재 {freeSeconds}초), 헤드 스왑 동영상 최대 {headSeconds}초(현재 {freeHeadSeconds}초)",
      "동영상 대기열 우선 순위",
      "완성된 동영상을 24시간이 아닌 7일 동안 보관",
    ],
    blackFriday: "사진 얼굴 교체가 {regular} 크레딧 대신 {member} 크레딧",
  },
};

const es: CreditsPageCopy = {
  packUses: "Unos {videos} vídeos Fast de 10 segundos, o {photos} fotos con cambio de cabeza",
  firstTopUp: {
    title: "Tu primera recarga, con cualquier paquete, también desbloquea:",
    items: [
      "Sin marca de agua en tus vídeos, cambios de cabeza y ediciones de fotos, y fotos con cambio de cara a resolución completa sin la pequeña marca de la esquina",
      "Vídeos de hasta {fullSeconds} segundos (ahora {freeSeconds}) y vídeos con cambio de cabeza de hasta {headSeconds} segundos (ahora {freeHeadSeconds})",
      "Un lugar al principio de la cola de vídeos",
      "Los vídeos terminados se guardan 7 días en lugar de 24 horas",
    ],
    blackFriday: "Cambio de cara en fotos por {member} créditos en lugar de {regular}",
  },
};

const ptBR: CreditsPageCopy = {
  packUses: "Cerca de {videos} vídeos Fast de 10 segundos, ou {photos} fotos com troca de cabeça",
  firstTopUp: {
    title: "Sua primeira recarga, com qualquer pacote, também libera:",
    items: [
      "Sem marca d'água nos seus vídeos, trocas de cabeça e edições de fotos, e fotos com troca de rosto em resolução total, sem a pequena marca no canto",
      "Vídeos de até {fullSeconds} segundos (agora {freeSeconds}) e vídeos com troca de cabeça de até {headSeconds} segundos (agora {freeHeadSeconds})",
      "Um lugar no início da fila de vídeos",
      "Vídeos prontos guardados por 7 dias em vez de 24 horas",
    ],
    blackFriday: "Troca de rosto em fotos por {member} créditos em vez de {regular}",
  },
};

const de: CreditsPageCopy = {
  packUses: "Etwa {videos} zehnsekündige Fast-Videos oder {photos} Head-Swap-Fotos",
  firstTopUp: {
    title: "Deine erste Aufladung, mit jedem Paket, schaltet außerdem frei:",
    items: [
      "Kein Wasserzeichen auf deinen Videos, Head-Swaps und Fotobearbeitungen, und Face-Swap-Fotos in voller Auflösung ohne die kleine Markierung in der Ecke",
      "Videos bis {fullSeconds} Sekunden (jetzt {freeSeconds}) und Head-Swap-Videos bis {headSeconds} Sekunden (jetzt {freeHeadSeconds})",
      "Einen Platz vorne in der Video-Warteschlange",
      "Fertige Videos werden 7 Tage statt 24 Stunden aufbewahrt",
    ],
    blackFriday: "Foto-Face-Swaps für {member} statt {regular} Credits",
  },
};

const fr: CreditsPageCopy = {
  packUses: "Environ {videos} vidéos Fast de 10 secondes, ou {photos} photos avec échange de tête",
  firstTopUp: {
    title: "Votre première recharge, avec n'importe quel pack, débloque aussi :",
    items: [
      "Plus de filigrane sur vos vidéos, échanges de tête et retouches photo, et des photos d'échange de visage en pleine résolution, sans la petite marque dans le coin",
      "Des vidéos jusqu'à {fullSeconds} secondes (actuellement {freeSeconds}), et des vidéos d'échange de tête jusqu'à {headSeconds} secondes (actuellement {freeHeadSeconds})",
      "Une place en tête de la file d'attente vidéo",
      "Les vidéos terminées sont conservées 7 jours au lieu de 24 heures",
    ],
    blackFriday: "L'échange de visage sur photo à {member} crédits au lieu de {regular}",
  },
};

const COPY: Record<AppLocale, CreditsPageCopy> = { en, "zh-CN": zhCN, ja, ko, es, "pt-BR": ptBR, de, fr };

export function creditsPageCopy(locale: string): CreditsPageCopy {
  return COPY[locale as AppLocale] ?? en;
}

/** Fills `{name}` placeholders. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}
