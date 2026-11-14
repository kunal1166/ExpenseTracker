
import { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  SlidersHorizontal,
  Bell,
  UserCircle,
  Mail,
  CalendarDays,
  IndianRupee,
  Save,
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { usePreferences } from "../context/PreferencesContext";
import type { Currency, DateFormat } from "../utils/formatters";

type SettingsSection =
  | "profile"
  | "preferences"
  | "security"
  | "notifications";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const {
    currency,
    dateFormat,
    loadingPreferences,
    updatePreferences,
  } = usePreferences();

  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  // Profile states
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isChangingPassword, setIsChangingPassword] =
    useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Preferences form states (global values are managed by PreferencesContext)
  const [draftCurrency, setDraftCurrency] = useState<Currency>(currency);
  const [draftDateFormat, setDraftDateFormat] =
    useState<DateFormat>(dateFormat);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState("");
  const [preferencesError, setPreferencesError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  // Keep the editable form in sync with globally loaded preferences
  useEffect(() => {
    setDraftCurrency(currency);
    setDraftDateFormat(dateFormat);
  }, [currency, dateFormat]);

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    {
      id: "preferences",
      label: "Preferences",
      icon: SlidersHorizontal,
    },
    { id: "security", label: "Security", icon: ShieldCheck },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
  ] as const;

  // Profile Update
  async function handleSaveProfile() {
    if (!name.trim()) {
      setErrorMessage("Name cannot be empty.");
      setSuccessMessage("");
      return;
    }

    try {
      setIsSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      await updateProfile(name.trim());

      setSuccessMessage("Profile updated successfully!");
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      setErrorMessage(
        message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Change Password
  async function handleChangePassword() {
    setPasswordSuccess("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setIsChangingPassword(true);

      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordSuccess("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      setPasswordError(
        message || "Failed to change password. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  // Save Preferences through the global PreferencesContext
  async function handleSavePreferences() {
    try {
      setIsSavingPreferences(true);
      setPreferencesSuccess("");
      setPreferencesError("");

      await updatePreferences(draftCurrency, draftDateFormat);

      setPreferencesSuccess("Preferences saved successfully!");
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      setPreferencesError(
        message || "Failed to save preferences. Please try again."
      );
    } finally {
      setIsSavingPreferences(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar
          search={search}
          onSearchChange={setSearch}
        />

        <div className="space-y-6 p-5 md:p-8">

          {/* Page Header */}
          <section>
            <p className="text-sm text-slate-500">
              Manage your account
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your profile, preferences and account security.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

            {/* Settings Navigation */}
            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account Settings
              </p>

              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive =
                    activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(section.id);
                        setSuccessMessage("");
                        setErrorMessage("");
                        setPasswordSuccess("");
                        setPasswordError("");
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={18} />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Settings Content */}
            <section className="space-y-6 lg:col-span-3">

              {/* PROFILE SECTION */}
              {activeSection === "profile" && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-100 p-5 md:p-6">
                    <h2 className="font-semibold text-slate-900">
                      Profile Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Update your personal account information.
                    </p>
                  </div>

                  <div className="space-y-5 p-5 md:p-6">

                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <UserCircle size={42} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {user?.name || "User"}
                        </h3>

                        <p className="text-sm text-slate-500">
                          Personal Account
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Full Name
                      </label>

                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setSuccessMessage("");
                            setErrorMessage("");
                          }}
                          placeholder="Enter your name"
                          maxLength={50}
                          className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Maximum 50 characters.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          value={user?.email || ""}
                          readOnly
                          className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-500"
                        />
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Email address cannot be changed here.
                      </p>
                    </div>

                    {successMessage && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        <CheckCircle2 size={18} />
                        {successMessage}
                      </div>
                    )}

                    {errorMessage && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {errorMessage}
                      </div>
                    )}

                    <div className="flex justify-end border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={
                          !name.trim() ||
                          isSaving ||
                          name.trim() === user?.name
                        }
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save size={17} />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PREFERENCES SECTION */}
              {activeSection === "preferences" && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-100 p-5 md:p-6">
                    <h2 className="font-semibold text-slate-900">
                      Application Preferences
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Customize how financial information is displayed.
                    </p>
                  </div>

                  <div className="space-y-6 p-5 md:p-6">

                    {loadingPreferences && (
                      <p className="text-sm text-slate-500">
                        Loading your preferences...
                      </p>
                    )}

                    {preferencesSuccess && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        <CheckCircle2 size={18} />
                        {preferencesSuccess}
                      </div>
                    )}

                    {preferencesError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {preferencesError}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Default Currency
                      </label>

                      <div className="relative">
                        <IndianRupee
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          value={draftCurrency}
                          onChange={(e) => {
                            setDraftCurrency(e.target.value as Currency);
                            setPreferencesSuccess("");
                            setPreferencesError("");
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="INR">
                            INR - Indian Rupee (₹)
                          </option>
                          <option value="USD">
                            USD - US Dollar ($)
                          </option>
                          <option value="EUR">
                            EUR - Euro (€)
                          </option>
                          <option value="GBP">
                            GBP - British Pound (£)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Date Format
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          value={draftDateFormat}
                          onChange={(e) => {
                            setDraftDateFormat(e.target.value as DateFormat);
                            setPreferencesSuccess("");
                            setPreferencesError("");
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="DD/MM/YYYY">
                            DD/MM/YYYY
                          </option>
                          <option value="MM/DD/YYYY">
                            MM/DD/YYYY
                          </option>
                          <option value="YYYY-MM-DD">
                            YYYY-MM-DD
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={handleSavePreferences}
                        disabled={isSavingPreferences || loadingPreferences}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save size={17} />
                        {isSavingPreferences ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY SECTION */}
              {activeSection === "security" && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-100 p-5 md:p-6">
                    <h2 className="font-semibold text-slate-900">
                      Account Security
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage your password and account protection.
                    </p>
                  </div>

                  <div className="space-y-5 p-5 md:p-6">

                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
                      <LockKeyhole
                        size={24}
                        className="text-blue-600"
                      />

                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          Change Password
                        </h3>

                        <p className="text-xs text-slate-500">
                          Keep your account secure with a strong password.
                        </p>
                      </div>
                    </div>

                    {/* Current Password */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Current Password
                      </label>

                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Enter current password"
                          autoComplete="current-password"
                          className="w-full rounded-lg border border-slate-200 py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          aria-label="Toggle current password visibility"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        New Password
                      </label>

                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          className="w-full rounded-lg border border-slate-200 py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(!showNewPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          aria-label="Toggle new password visibility"
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Minimum 6 characters.
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Confirm New Password
                      </label>

                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          className="w-full rounded-lg border border-slate-200 py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Messages */}
                    {passwordSuccess && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        <CheckCircle2 size={18} />
                        {passwordSuccess}
                      </div>
                    )}

                    {passwordError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {passwordError}
                      </div>
                    )}

                    {/* Change Password Button */}
                    <div className="flex justify-end border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShieldCheck size={17} />

                        {isChangingPassword
                          ? "Updating..."
                          : "Change Password"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS SECTION */}
              {activeSection === "notifications" && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                      <Bell size={24} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Notification Preferences
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Control your financial alerts and reminders.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">
                      Budget alerts and daily spending notifications
                      will be implemented in a later step.
                    </p>
                  </div>
                </div>
              )}

            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
