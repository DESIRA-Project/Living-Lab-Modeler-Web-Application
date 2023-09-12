import {Outcome} from "../../../../Models/Outcome";
import {AssetResourceDetails} from "../../../../Models/AssetResourceDetails";
import {OutcomeTag} from "../../../../Models/OutcomeTag";

export function outcomesDiffer(o1?: Outcome, o2?: Outcome): boolean {
  if (o1 === o2) {
    return false;
  }
  if (!o1 || !o2) {
    return true;
  }
  return o1.id !== o2.id
    || o1.livingLabId !== o2.livingLabId
    || o1.title != o2.title
    || o1.description != o2.description
    || arraysDiffer(o1.outcomeTags, o2.outcomeTags, outcomeTagsDiffer)
    || arraysDiffer(o1.assetResourceDetails, o2.assetResourceDetails, assetResourceDetailsDiffer)
    ;
}

function outcomeTagsDiffer(ot1: OutcomeTag, ot2: OutcomeTag): boolean {
  if (ot1 === ot2) {
    return false;
  }
  if (!ot1 || !ot2) {
    return true;
  }
  return ot1.id !== ot2.id || ot1.name !== ot2.name;
}

function assetResourceDetailsDiffer(a1: AssetResourceDetails, a2: AssetResourceDetails): boolean {
  if (a1 === a2) {
    return false;
  }
  if (!a1 || !a2) {
    return true;
  }
  return a1.id != a2.id
    || a1.title != a2.title
    || a1.description != a2.description
    || a1.assetResourceType?.id != a2.assetResourceType?.id
    || a1.fileWrapper.content != a2.fileWrapper.content;
}

function arraysDiffer(A1: any[] | undefined, A2: any[] | undefined, elementsDiffer: (e1: any, e2: any) => boolean): boolean {
  // Set empty list if null or undefined, and sort by id
  A1 = A1 ? [...A1].sort((a: Outcome, b: Outcome) => (a.id ?? 0) - (b.id ?? 0)) : [];
  A2 = A2 ? [...A2].sort((a: Outcome, b: Outcome) => (a.id ?? 0) - (b.id ?? 0)) : [];
  if (A1.length !== A2.length) {
    return true;
  }
  for (let i = 0; i < A1.length; i++) {
    if (elementsDiffer(A1[i], A2[i])) {
      return true;
    }
  }
  return false;
}
