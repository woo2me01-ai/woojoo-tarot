/* 기기 기능: 진동 (공유·복사는 share.js) */
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export function tap() { Haptics.impact({ style:ImpactStyle.Light }).catch(() => {}); }
export function thud() { Haptics.impact({ style:ImpactStyle.Medium }).catch(() => {}); }
