/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useRouter } from "next/router";
import { string } from "zod";

import langId from "../lang/id.json";
import langEn from "../lang/en.json";

interface KV {
  [key: string]: string;
}
interface I18nMap {
  [key: string]: KV;
}

const MESSAGES: I18nMap = {
  id: langId,
  en: langEn,
};

export default function _L(key: string, ...args: any[]) {
  const { locale } = useRouter();

  if (locale === undefined) {
    return key;
  }

  const langMaps = MESSAGES[locale];

  const translated: string | undefined = langMaps && langMaps[key];

  if (translated === undefined) {
    return key;
  }

  return translated;
}
