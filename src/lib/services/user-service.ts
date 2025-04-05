import { supabase } from "../supabase";
import { currentUser, User } from "@clerk/nextjs/server";

export async function syncUserWithSupabase() {
  try {
    const user: User | null = await currentUser();

    if (!user) {
      console.error("No user found");
      return null;
    }

    const userData = {
      clerk_id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.emailAddresses[0]?.emailAddress,
      first_name: user.firstName,
      last_name: user.lastName,
      image_url: user.imageUrl,
      primary_email_address_id: user.primaryEmailAddressId,
      primary_phone_number_id: user.primaryPhoneNumberId,
      phone: user.phoneNumbers[0]?.phoneNumber,
      email_verified_at:
        user?.emailAddresses[0]?.verification?.status === "verified"
          ? new Date().toISOString()
          : null,
      last_login_at: new Date().toISOString(),
      metadata: user.publicMetadata,
    };

    // Upsert user to Supabase
    const { data, error } = await supabase
      .from("smartusers")
      .upsert(userData)
      .select("*")
      .single();

    if (error) {
      console.error("Error syncing user to Supabase:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in syncUserWithSupabase:", error);
    return null;
  }
}

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
