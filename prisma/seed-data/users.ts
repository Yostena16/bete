import type { ListerType, Role } from "../../src/generated/prisma/enums";

export type UserSeed = {
  key: string;
  name: string;
  /** +251 mobile format. Numbers are in the 09xx range Ethio Telecom actually issues. */
  phone: string;
  email?: string;
  role: Role;
  listerType?: ListerType;
  phoneVerified: boolean;
};

/**
 * Brokers dominate the Addis market and pretending otherwise would be
 * dishonest, so the seed reflects the real mix: more brokers and agencies than
 * direct owners. Seekers can filter them out, which is the point.
 */
export const USERS: UserSeed[] = [
  {
    key: "admin",
    name: "Bete moderation",
    phone: "+251911000001",
    email: "admin@bete.et",
    role: "ADMIN",
    phoneVerified: true,
  },

  // Owners
  { key: "abebe", name: "Abebe Kebede", phone: "+251911204471", role: "LISTER", listerType: "OWNER", phoneVerified: true },
  { key: "tigist", name: "Tigist Haile", phone: "+251911338052", role: "LISTER", listerType: "OWNER", phoneVerified: true },
  { key: "mulugeta", name: "Mulugeta Assefa", phone: "+251912447719", role: "LISTER", listerType: "OWNER", phoneVerified: true },
  { key: "rahel", name: "Rahel Desta", phone: "+251913882064", role: "LISTER", listerType: "OWNER", phoneVerified: false },
  { key: "yohannes", name: "Yohannes Bekele", phone: "+251911765530", role: "LISTER", listerType: "OWNER", phoneVerified: true },
  { key: "meseret", name: "Meseret Alemu", phone: "+251910447283", role: "LISTER", listerType: "OWNER", phoneVerified: true },

  // Brokers — individual delalas
  { key: "dawit", name: "Dawit Mekonnen", phone: "+251911559034", role: "LISTER", listerType: "BROKER", phoneVerified: true },
  { key: "solomon", name: "Solomon Tesfaye", phone: "+251912663117", role: "LISTER", listerType: "BROKER", phoneVerified: true },
  { key: "hanna", name: "Hanna Girma", phone: "+251913221948", role: "LISTER", listerType: "BROKER", phoneVerified: true },
  { key: "bereket", name: "Bereket Wolde", phone: "+251911890226", role: "LISTER", listerType: "BROKER", phoneVerified: false },
  { key: "eyob", name: "Eyob Tsegaye", phone: "+251914037715", role: "LISTER", listerType: "BROKER", phoneVerified: true },
  { key: "selam", name: "Selamawit Tadesse", phone: "+251912118460", role: "LISTER", listerType: "BROKER", phoneVerified: true },

  // Agencies
  { key: "gojo", name: "Gojo Properties", phone: "+251115570042", email: "listings@gojoproperties.et", role: "LISTER", listerType: "AGENCY", phoneVerified: true },
  { key: "zewde", name: "Zewde Real Estate", phone: "+251115518830", email: "info@zewderealestate.et", role: "LISTER", listerType: "AGENCY", phoneVerified: true },
  { key: "addislocator", name: "Addis Home Locator", phone: "+251948800127", email: "hello@addishomelocator.et", role: "LISTER", listerType: "AGENCY", phoneVerified: true },

  // Seekers
  { key: "kidist", name: "Kidist Assefa", phone: "+251911402863", email: "kidist.assefa@example.et", role: "SEEKER", phoneVerified: true },
  { key: "fikru", name: "Fikru Negash", phone: "+251913774510", role: "SEEKER", phoneVerified: false },
];
