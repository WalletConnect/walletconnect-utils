import { ONE_THOUSAND } from "../constants";

export function toMiliseconds(seconds: number): number {
  return seconds * ONE_THOUSAND;
}

export function fromMiliseconds(miliseconds: number): number {
  return Math.floor(miliseconds / ONE_THOUSAND);
}
