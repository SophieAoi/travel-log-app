import { useState, type ChangeEvent, type FormEvent } from "react";
import { Settings as SettingsIcon, Camera, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BIO_MAX = 160;
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function Settings() {
  const { user, updateProfile, uploadAvatar, changePassword } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [email, setEmail] = useState(user?.email ?? "");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const initial = user?.displayName.trim().charAt(0).toUpperCase() ?? "?";

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Failed to update profile picture");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    setProfileSaving(true);
    try {
      await updateProfile({ displayName: displayName.trim(), bio: bio.trim() });
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setEmailSaved(false);
    setEmailSaving(true);
    try {
      await updateProfile({ email: email.trim() });
      setEmailSaved(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1>
          <SettingsIcon size={26} color="var(--color-accent)" /> Settings
        </h1>
      </div>
      <p className="page-subtitle">Manage your profile, email, and password.</p>

      <section className="settings-section">
        <h2>Profile picture</h2>
        <label className="avatar-upload" title="Change profile picture">
          <span className="avatar avatar-lg">
            {user?.avatarUrl ? <img src={`${API_BASE}${user.avatarUrl}`} alt="" /> : <span>{initial}</span>}
          </span>
          <span className={`avatar-upload-overlay ${uploadingAvatar ? "avatar-upload-overlay-visible" : ""}`}>
            {uploadingAvatar ? <span className="avatar-upload-spinner" /> : <Camera size={18} />}
          </span>
          <input type="file" accept="image/*" onChange={handleAvatarChange} hidden disabled={uploadingAvatar} />
        </label>
        {avatarError && <p className="error">{avatarError}</p>}
      </section>

      <section className="settings-section">
        <h2>Profile</h2>
        <form onSubmit={handleProfileSubmit} className="settings-form">
          <div className="field">
            <label htmlFor="displayName">Name</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setProfileSaved(false);
              }}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              className="settings-textarea"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value.slice(0, BIO_MAX));
                setProfileSaved(false);
              }}
              rows={3}
              placeholder="Tell people a bit about your travels..."
            />
            <span className="bio-char-count">
              {bio.length}/{BIO_MAX}
            </span>
          </div>
          {profileError && <p className="error">{profileError}</p>}
          <div className="settings-form-actions">
            <button type="submit" disabled={profileSaving || !displayName.trim()}>
              {profileSaving ? "Saving…" : "Save profile"}
            </button>
            {profileSaved && (
              <span className="settings-saved">
                <Check size={14} /> Saved
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="settings-section">
        <h2>Email</h2>
        <form onSubmit={handleEmailSubmit} className="settings-form">
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailSaved(false);
              }}
              required
            />
          </div>
          {emailError && <p className="error">{emailError}</p>}
          <div className="settings-form-actions">
            <button type="submit" disabled={emailSaving || !email.trim() || email === user?.email}>
              {emailSaving ? "Saving…" : "Update email"}
            </button>
            {emailSaved && (
              <span className="settings-saved">
                <Check size={14} /> Saved
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="settings-section">
        <h2>Password</h2>
        <form onSubmit={handlePasswordSubmit} className="settings-form">
          <div className="field">
            <label htmlFor="currentPassword">Current password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {passwordError && <p className="error">{passwordError}</p>}
          <div className="settings-form-actions">
            <button type="submit" disabled={passwordSaving || !currentPassword || !newPassword}>
              {passwordSaving ? "Saving…" : "Change password"}
            </button>
            {passwordSaved && (
              <span className="settings-saved">
                <Check size={14} /> Password changed
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
