"use client";

import React, { useActionState } from "react";
import { saveSiteSettings, type SettingsActionState } from "./action";
import { Save, CheckCircle, Building2, Phone, Mail, MapPin, Share2, Info } from "lucide-react";

interface SettingsFormProps {
  settings: Record<string, string>;
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSiteSettings, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Site settings have been saved successfully!</span>
        </div>
      )}

      {/* 1. General & Legal Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b pb-3">
          <Building2 className="w-4 h-4 text-nepal-red" />
          General & Legal Information (संस्था तथा सूचना विभाग विवरण)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Site Title / पोर्टलको नाम *
            </label>
            <input
              type="text"
              name="site_name"
              defaultValue={settings.site_name || "KTM Post"}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Tagline / स्लोगन
            </label>
            <input
              type="text"
              name="site_tagline"
              defaultValue={settings.site_tagline || "Trusted News from Nepal"}
              placeholder="e.g. Trusted News from Nepal"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Legal Company & Dept of Information Registration (कम्पनी तथा सूचना विभाग दर्ता नं) *
            </label>
            <input
              type="text"
              name="company_name_legal"
              defaultValue={
                settings.company_name_legal ||
                "डिजी भिजन प्रा. लि., सूचना विभाग द.नं. ५३१६-२०८२/०८३"
              }
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red font-nepali-serif text-base"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Displayed directly in the official footer and contact credentials.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Editor-in-Chief / प्रधान सम्पादक
            </label>
            <input
              type="text"
              name="editor_in_chief"
              defaultValue={settings.editor_in_chief || ""}
              placeholder="e.g. सम्पादकको नाम"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red font-nepali-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Press Council Registration / प्रेस काउन्सिल दर्ता
            </label>
            <input
              type="text"
              name="press_reg_no"
              defaultValue={settings.press_reg_no || ""}
              placeholder="e.g. दर्ता नं"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & Address */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b pb-3">
          <MapPin className="w-4 h-4 text-nepal-red" />
          Contact & Location (सम्पर्क तथा ठेगाना)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              Office Address / ठेगाना
            </label>
            <input
              type="text"
              name="office_address"
              defaultValue={settings.office_address || "Sukedhara, Kathmandu, Nepal"}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              Contact Email / इमेल
            </label>
            <input
              type="email"
              name="contact_email"
              defaultValue={settings.contact_email || "info@ktmpost.com"}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              Mobile / Phone / फोन
            </label>
            <input
              type="text"
              name="contact_phone"
              defaultValue={settings.contact_phone || "9851320822"}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Social Media Links */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b pb-3">
          <Share2 className="w-4 h-4 text-nepal-red" />
          Social Media Links (सामाजिक सञ्जाल)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Facebook Page URL
            </label>
            <input
              type="url"
              name="facebook_url"
              defaultValue={settings.facebook_url || ""}
              placeholder="https://facebook.com/ktmpost"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Twitter / X URL
            </label>
            <input
              type="url"
              name="twitter_url"
              defaultValue={settings.twitter_url || ""}
              placeholder="https://x.com/ktmpost"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              YouTube Channel URL
            </label>
            <input
              type="url"
              name="youtube_url"
              defaultValue={settings.youtube_url || ""}
              placeholder="https://youtube.com/@ktmpost"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              TikTok URL
            </label>
            <input
              type="url"
              name="tiktok_url"
              defaultValue={settings.tiktok_url || ""}
              placeholder="https://tiktok.com/@ktmpost"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nepal-red font-mono"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="admin-btn-primary px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving Settings...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Site Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}
