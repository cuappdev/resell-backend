import { Service } from "typedi";
import { HttpError } from "routing-controllers";
import fetch from "node-fetch";

import { ITUNES_LOOKUP_URL } from "../constants";

interface ITunesLookupResult {
  resultCount: number;
  results: Array<{ version?: string }>;
}

@Service()
export class AppVersionService {
  public async fetchIosAppStoreVersion(): Promise<string> {
    let response: fetch.Response;
    try {
      response = await fetch(ITUNES_LOOKUP_URL);
    } catch (_err) {
      throw new HttpError(502, "Failed to fetch app version from App Store");
    }

    let data: ITunesLookupResult;
    try {
      data = (await response.json()) as ITunesLookupResult;
    } catch (_err) {
      throw new HttpError(502, "Failed to parse App Store response");
    }

    if (!response.ok || !data.results?.length) {
      throw new HttpError(502, "Failed to fetch app version from App Store");
    }

    const version = data.results[0]?.version;
    if (!version) {
      throw new HttpError(502, "Version not found in App Store response");
    }

    return version;
  }
}

