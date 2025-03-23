import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCog,
  faLock,
  faQuestionCircle,
  faPencilAlt,
  faSave,
  faVideo,
  faMapMarkerAlt,
  faChevronRight,
  faSignOutAlt,
  faEnvelope,
  faBell,
  faMoon,
  faShieldAlt,
  faEye,
  faLocationArrow,
  faCalendar,
  faBook,
  faHeadset,
  faInfoCircle,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";


interface UserProfileTab {
  id: "profile" | "settings" | "privacy" | "help";
  label: string;
  icon: IconDefinition;
}

export default function UserProfile() {
  const [navigate] = useLocation();
  const { user, isLoading, updateProfile, logout } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<UserProfileTab["id"]>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailNotifications: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showLocation: true,
    showAge: true,
    showLastSeen: true,
  });
  const [editedProfile, setEditedProfile] = useState({
    profileName: "",
    age: 0,
    gender: "",
    location: "",
    bio: "",
    occupation: "",
    education: "",
    lookingFor: "",
    interests: [] as string[],
    newInterest: "",
  });

  useEffect(() => {
    if (user) {
      setEditedProfile({
        profileName: user.profileName,
        age: user.age,
        gender: user.gender,
        location: user.location,
        bio: user.bio || "",
        occupation: user.occupation || "",
        education: user.education || "",
        lookingFor: user.lookingFor,
        interests: [...user.interests],
        newInterest: "",
      });
    }
  }, [user]);

  const tabs: UserProfileTab[] = [
    { id: "profile", label: "Profile", icon: faUser },
    { id: "settings", label: "Settings", icon: faCog },
    { id: "privacy", label: "Privacy", icon: faLock },
    { id: "help", label: "Help", icon: faQuestionCircle },
  ];

  const handleEditProfile = () => {
    if (!user) return;
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        profileName: editedProfile.profileName,
        age: editedProfile.age,
        gender: editedProfile.gender,
        location: editedProfile.location,
        bio: editedProfile.bio,
        occupation: editedProfile.occupation,
        education: editedProfile.education,
        lookingFor: editedProfile.lookingFor,
        interests: editedProfile.interests,
        settings: settings,
        privacy: privacy
      });

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  const handleUploadVideo = () => {
    fileInputRef.current?.click();
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    try {
      await updateProfile({ settings: { ...settings, [key]: value } });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handlePrivacyChange = async (key: string, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    try {
      await updateProfile({ privacy: { ...privacy, [key]: value } });
      toast({
        title: "Privacy settings updated",
        description: "Your privacy settings have been saved",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };

  const handleAddInterest = () => {
    if (editedProfile.newInterest.trim() === "") return;

    if (!editedProfile.interests.includes(editedProfile.newInterest)) {
      setEditedProfile({
        ...editedProfile,
        interests: [
          ...editedProfile.interests,
          editedProfile.newInterest.trim(),
        ],
        newInterest: "",
      });
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setEditedProfile({
      ...editedProfile,
      interests: editedProfile.interests.filter((i) => i !== interest),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, would upload to a server and get back a URL
      toast({
        title: "Video uploaded",
        description: "Your profile video has been updated",
      });
    }
  };

  const { data: matches } = useQuery({
    queryKey: ["/api/matches"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">Not logged in</h2>
        <p className="text-neutral-600 mb-4">
          Please log in to view your profile
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <button
        className={`fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-100 shadow-md ${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <FontAwesomeIcon icon={faChevronRight} className={`transform ${isSidebarOpen ? 'rotate-90' : 'rotate-0'}`} />
      </button>
      <div className={`flex-1 min-h-screen pb-24`}>
        <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b border-neutral-200">
              <h1 className="text-xl font-semibold">Profile</h1>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEditProfile}>
                    <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSaveProfile}>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save
                  </Button>
                )}
              </div>
            </header>

            {/* Tab Navigation */}
            <div className="px-4 pt-4">
              <div className="flex border-b border-neutral-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex-1 pb-3 text-center text-sm ${activeTab === tab.id ? "border-b-2 border-primary text-primary font-medium" : "text-neutral-500"}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="mr-1" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden">
                        {user?.profileVideoUrl ? (
                          <video
                            src={user.profileVideoUrl}
                            className="w-full h-full object-cover"
                            loop
                            muted
                            autoPlay
                            playsInline
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-neutral-400">
                            <FontAwesomeIcon icon={faUser} className="text-3xl" />
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md"
                          onClick={handleUploadVideo}
                        >
                          <FontAwesomeIcon icon={faVideo} />
                        </button>
                      )}
                      <Input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="video/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="ml-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="Your name"
                            value={editedProfile.profileName}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                profileName: e.target.value,
                              })
                            }
                            className="font-semibold text-lg"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Age"
                              value={editedProfile.age || ""}
                              onChange={(e) =>
                                setEditedProfile({
                                  ...editedProfile,
                                  age: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-20"
                            />
                            <Input
                              type="text"
                              placeholder="Gender"
                              value={editedProfile.gender}
                              onChange={(e) =>
                                setEditedProfile({
                                  ...editedProfile,
                                  gender: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold">
                            {user.profileName}
                          </h2>
                          <p className="text-neutral-600">
                            {user.age} • {user.gender}
                          </p>
                        </>
                      )}
                      <div className="flex gap-2 mt-2">
                        <div className="text-center">
                          <div className="font-semibold">{matches?.length || 0}</div>
                          <div className="text-xs text-neutral-500">Matches</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">4.8</div>
                          <div className="text-xs text-neutral-500">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">82%</div>
                          <div className="text-xs text-neutral-500">Response</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">About Me</h3>
                      {isEditing ? (
                        <Textarea
                          placeholder="Write something about yourself..."
                          value={editedProfile.bio}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              bio: e.target.value,
                            })
                          }
                          className="min-h-[100px]"
                        />
                      ) : (
                        <p className="text-neutral-700">
                          {user.bio || "No bio provided yet."}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-neutral-500">Location</div>
                        {isEditing ? (
                          <Input
                            type="text"
                            placeholder="Your location"
                            value={editedProfile.location}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                location: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="text-neutral-500 mr-2"
                            />
                            <span>{user.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-neutral-500">Looking for</div>
                        {isEditing ? (
                          <Input
                            type="text"
                            placeholder="What are you looking for?"
                            value={editedProfile.lookingFor}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                lookingFor: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faHeart}
                              className="text-neutral-500 mr-2"
                            />
                            <span>{user.lookingFor}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-neutral-500">Occupation</div>
                        {isEditing ? (
                          <Input
                            type="text"
                            placeholder="Your occupation"
                            value={editedProfile.occupation}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                occupation: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faBriefcase}
                              className="text-neutral-500 mr-2"
                            />
                            <span>{user.occupation || "Not specified"}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-neutral-500">Education</div>
                        {isEditing ? (
                          <Input
                            type="text"
                            placeholder="Your education"
                            value={editedProfile.education}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                education: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faGraduationCap}
                              className="text-neutral-500 mr-2"
                            />
                            <span>{user.education || "Not specified"}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Interests</h3>
                      {isEditing ? (
                        <>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editedProfile.interests.map((interest, index) => (
                              <div
                                key={index}
                                className="bg-neutral-100 px-3 py-1 rounded-full text-sm flex items-center"
                              >
                                {interest}
                                <button
                                  className="ml-2 text-neutral-500 hover:text-red-500"
                                  onClick={() => handleRemoveInterest(interest)}
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex mt-2">
                            <Input
                              type="text"
                              placeholder="Add interest"
                              value={editedProfile.newInterest}
                              onChange={(e) =>
                                setEditedProfile({
                                  ...editedProfile,
                                  newInterest: e.target.value,
                                })
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleAddInterest()
                              }
                              className="mr-2"
                            />
                            <Button variant="outline" onClick={handleAddInterest}>
                              Add
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="bg-neutral-100 px-3 py-1 rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))}
                          {user.interests.length === 0 && (
                            <span className="text-neutral-500">
                              No interests added yet.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="border border-neutral-200 rounded-lg divide-y">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Push Notifications</h3>
                        <p className="text-sm text-neutral-500">Receive push notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications}
                        onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                      />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Dark Mode</h3>
                        <p className="text-sm text-neutral-500">Enable dark theme</p>
                      </div>
                      <Switch
                        checked={settings.darkMode}
                        onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                      />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-neutral-500">Receive email updates</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                      />
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </Button>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-4">
                  <div className="border border-neutral-200 rounded-lg divide-y">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Profile Visibility</h3>
                        <p className="text-sm text-neutral-500">Who can see your profile</p>
                      </div>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="public">Public</option>
                        <option value="matches">Matches Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Location</h3>
                        <p className="text-sm text-neutral-500">Display your location</p>
                      </div>
                      <Switch
                        checked={privacy.showLocation}
                        onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                      />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Age</h3>
                        <p className="text-sm text-neutral-500">Display your age</p>
                      </div>
                      <Switch
                        checked={privacy.showAge}
                        onCheckedChange={(checked) => handlePrivacyChange('showAge', checked)}
                      />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Last Seen Status</h3>
                        <p className="text-sm text-neutral-500">Show when you were last active</p>
                      </div>
                      <Switch
                        checked={privacy.showLastSeen}
                        onCheckedChange={(checked) => handlePrivacyChange('showLastSeen', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Help Tab */}
              {activeTab === "help" && (
                <div className="space-y-4">
                  <div className="border border-neutral-200 rounded-lg divide-y">
                    <button className="w-full p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faBook} className="text-primary mr-3" />
                        <div className="text-left">
                          <h3 className="font-medium">FAQs</h3>
                          <p className="text-sm text-neutral-500">Frequently asked questions</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
                    </button>

                    <button className="w-full p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faHeadset} className="text-primary mr-3" />
                        <div className="text-left">
                          <h3 className="font-medium">Contact Support</h3>
                          <p className="text-sm text-neutral-500">Get help from our team</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
                    </button>

                    <button className="w-full p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-primary mr-3" />
                        <div className="text-left">
                          <h3 className="font-medium">About</h3>
                          <p className="text-sm text-neutral-500">App information</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}