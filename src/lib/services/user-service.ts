import { supabase } from "../supabase";


export async function getUserById(clerkId: string) {
  try {
    const { data, error } = await supabase
      .from("smartusers")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      console.error("Error fetching user from Supabase:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}

export async function getUserByMarketingConsent(marketingConsent: boolean) {
  try {
    const { data, error } = await supabase
      .from("smartusers")
      .select("*")
      .eq("marketing_consent", marketingConsent);

    if (error) {
      console.error("Error fetching user by marketing consent:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in getUserByMarketingConsent:", error);
    return null;
  }
}

export async function changeMarketingConsent(
  clerkId: string,
  marketingConsent: boolean
) {
  try {
    const { error } = await supabase
      .from("smartusers")
      .update({ marketing_consent: marketingConsent })
      .eq("clerk_id", clerkId);
    if (error) {
      console.error("Error in changeMarketingConsent:", error);
      return null;
    }
    return { message: "Marketing consent updated", clerkId };
  } catch (error) {
    console.error("Error in changeMarketingConsent:", error);
    return { message: "Error updating marketing consent" };
  }
}
