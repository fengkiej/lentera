import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Loading from "@/components/Loading";
import { ArrowLeft, LogOut, User, Mail, Calendar, Edit2, X, Eye, EyeOff, Settings, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JwtApiClient } from "../services/apiClient";
import { useUserService } from "../services/userService";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation("profile");

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const userService = useUserService();
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await JwtApiClient.getCurrentUser();
        if (response.success && response.data.user) {
          setUserData(response.data.user as unknown as UserData);
        } else {
          setError("Gagal memuat data profil");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []); // Empty dependency array untuk mencegah infinite loop

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const handleUpdateProfile = async () => {
    if (!editForm.name.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }

    setIsUpdatingProfile(true);
    setError("");

    try {
      const response = await userService.updateProfile({ name: editForm.name });
      if (response.success) {
        setUserData((prev) => (prev ? { ...prev, name: editForm.name } : null));
        setShowEditModal(false);
        setError("");
      } else {
        setError("Gagal memperbarui profil");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memperbarui profil");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("Semua field password harus diisi");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter");
      return;
    }

    setIsChangingPassword(true);
    setError("");

    try {
      const response = await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (response.success) {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setError("");
        toast({
          title: "Password berhasil diubah!",
          variant: "default",
        });
      } else {
        setError(response.message || "Gagal mengubah password");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat mengubah password";
      setError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white pb-16">
      {/* Profile Content */}
      <div className="min-h-screen bg-gray-50">
        {isLoading ? (
          <Loading message={t("loading.profile")} />
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <User className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          </div>
        ) : userData ? (
          <div>
            {/* Hero Profile Section */}
            <div className="bg-gradient-to-r from-brand-deep-green-600 to-brand-deep-green-700 px-6 py-20 text-center relative">
              {/* Language Switcher in top right */}
              <div className="absolute top-6 right-6">
                <LanguageSwitcher />
              </div>

              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="h-16 w-16 text-brand-deep-green-700" />
              </div>
              <h2 className="text-4xl font-merriweather font-bold text-white mb-3">{userData.name}</h2>
              <p className="text-brand-desert-gold-200 text-xl mb-2">{userData.email}</p>
              <p className="text-white/80 text-base">
                {t("info.memberSince")} {formatDate(userData.createdAt)}
              </p>
            </div>

            {/* Profile Details */}
            <div className="bg-white px-6 py-12">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Personal Information */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                      <User className="h-6 w-6 mr-3 text-brand-deep-green-600" />
                      {t("info.personalInformation")}
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-14 h-14 bg-brand-deep-green-600/50 rounded-2xl flex items-center justify-center">
                          <User className="h-7 w-7 text-brand-deep-green-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">{t("info.fullName")}</p>
                          <p className="text-xl text-gray-900 font-semibold">{userData.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-14 h-14 bg-brand-deep-green-600/50 rounded-2xl flex items-center justify-center">
                          <Mail className="h-7 w-7 text-brand-deep-green-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">{t("info.email")}</p>
                          <p className="text-xl text-gray-900 font-semibold">{userData.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings & Actions */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Settings className="h-6 w-6 mr-3 text-brand-deep-green-600" />
                      {t("settings.title")}
                    </h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          setEditForm({ name: userData.name });
                          setShowEditModal(true);
                        }}
                        className="w-full justify-start bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white rounded-2xl py-6 h-auto"
                      >
                        <Edit2 className="h-6 w-6 mr-4" />
                        <div className="text-left">
                          <p className="font-semibold text-lg">{t("actions.editProfile")}</p>
                          <p className="text-sm">{t("actions.editProfileDesc")}</p>
                        </div>
                      </Button>

                      <Button
                        onClick={() => {
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          setShowPasswordModal(true);
                        }}
                        variant="outline"
                        className="w-full justify-start border-brand-deep-green-600/50 text-brand-deep-green-700 rounded-2xl py-6 h-auto"
                      >
                        <X className="h-6 w-6 mr-4" />
                        <div className="text-left">
                          <p className="font-semibold text-lg">{t("actions.changePassword")}</p>
                          <p className="text-sm text-gray-500">{t("actions.changePasswordDesc")}</p>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">{t("modals.editProfile.title")}</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("modals.editProfile.nameLabel")}</label>
                  <Input type="text" value={editForm.name} onChange={(e) => setEditForm({ name: e.target.value })} placeholder={t("modals.editProfile.namePlaceholder")} className="w-full rounded-xl" />
                </div>
                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
              </div>
              <div className="flex space-x-3 mt-6">
                <Button onClick={() => setShowEditModal(false)} variant="outline" className="flex-1 rounded-xl">
                  {t("modals.editProfile.cancel")}
                </Button>
                <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="flex-1 bg-brand-deep-green-700 hover:bg-brand-deep-green-800 rounded-xl">
                  {isUpdatingProfile ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t("modals.editProfile.saving")}
                    </div>
                  ) : (
                    t("modals.editProfile.save")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">{t("modals.changePassword.title")}</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("modals.changePassword.currentPasswordLabel")}</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder={t("modals.changePassword.currentPasswordPlaceholder")}
                      className="w-full pr-10 rounded-xl"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("modals.changePassword.newPasswordLabel")}</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder={t("modals.changePassword.newPasswordPlaceholder")}
                      className="w-full pr-10 rounded-xl"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("modals.changePassword.confirmPasswordLabel")}</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder={t("modals.changePassword.confirmPasswordPlaceholder")}
                      className="w-full pr-10 rounded-xl"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
              </div>
              <div className="flex space-x-3 mt-6">
                <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1 rounded-xl">
                  {t("modals.changePassword.cancel")}
                </Button>
                <Button onClick={handleChangePassword} disabled={isChangingPassword} className="flex-1 bg-brand-deep-green-700 hover:bg-brand-deep-green-800 rounded-xl">
                  {isChangingPassword ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t("modals.changePassword.changing")}
                    </div>
                  ) : (
                    t("modals.changePassword.change")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="px-6 py-8 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleLogout} variant="outline" className="w-full flex items-center justify-center space-x-3 text-red-600 border-red-200 hover:bg-red-50 rounded-2xl py-4 h-auto">
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">{t("header.logout")}</span>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Profile;
