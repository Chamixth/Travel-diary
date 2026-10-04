import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { PricingPlan } from "@/interface/pricing";

import { requireAccessToken } from "./session.server";
import { toClientError } from "./service-error";
import * as pricingService from "./pricing.service";

export const listPricingPlansFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PricingPlan[]> => {
    try {
      return await pricingService.listPricingPlans();
    } catch (error) {
      toClientError(error);
    }
  },
);

export const getCurrentPricingPlanFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PricingPlan> => {
    try {
      return await pricingService.getCurrentPricingPlan(await requireAccessToken());
    } catch (error) {
      toClientError(error);
    }
  },
);

export const changePricingPlanFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().trim().min(1) }))
  .handler(async ({ data }): Promise<PricingPlan> => {
    try {
      return await pricingService.changePricingPlan(await requireAccessToken(), data.slug);
    } catch (error) {
      toClientError(error);
    }
  });
