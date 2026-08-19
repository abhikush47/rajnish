'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldAlert, 
  LogOut, 
  Clock, 
  Check, 
  X, 
  FileText, 
  LayoutDashboard, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw,
  Eye,
  CheckCheck,
  UserCheck,
  Plus,
  Trash2,
  Edit,
  Play,
  Menu,
  Globe,
  Lightbulb
} from 'lucide-react';

export default function AdminPage({ params: { locale } }) {
  const t = useTranslations('admin');
  const isNepali = locale === 'ne';
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === 'ne' ? 'en' : 'ne';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, connect, volunteers, feedback, videos, youth_ideas
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  // Data State
  const [data, setData] = useState({
    connect_requests: [],
    volunteers: [],
    feedback: [],
    social_videos: [],
    youth_ideas: []
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Youth Idea Modal States
  const [selectedYouthIdea, setSelectedYouthIdea] = useState(null);
  const [updatingYouthIdea, setUpdatingYouthIdea] = useState(false);
  const [tempStatus, setTempStatus] = useState('');
  const [tempAdminNote, setTempAdminNote] = useState('');
  const [tempProgressPercent, setTempProgressPercent] = useState(0);
  const [tempTimelineMessage, setTempTimelineMessage] = useState('');
  const [adminTimelineUpdates, setAdminTimelineUpdates] = useState([]);
  const [adminTimelineLoading, setAdminTimelineLoading] = useState(false);
  const [youthIdeasSearch, setYouthIdeasSearch] = useState('');
  const [youthIdeasStatusFilter, setYouthIdeasStatusFilter] = useState('all');
  const [youthIdeasCategoryFilter, setYouthIdeasCategoryFilter] = useState('all');
  const [youthIdeasLangFilter, setYouthIdeasLangFilter] = useState('all');

  // Unified deletion state
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, type }

  // Video Form state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null); // null = add, video object = edit
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleNe, setFormTitleNe] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDescNe, setFormDescNe] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formCoverSource, setFormCoverSource] = useState('auto'); // auto, custom
  const [formThumbnailStatus, setFormThumbnailStatus] = useState('none'); // auto, custom, none, failed
  const [formErrorMsg, setFormErrorMsg] = useState(''); // Custom resolution error details
  const [formPlatform, setFormPlatform] = useState('other');
  const [formStatus, setFormStatus] = useState('draft'); // draft, published

  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Lock scroll when admin mobile menu is open
  useEffect(() => {
    if (isAdminMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isAdminMenuOpen]);

  // Load timeline updates for selected Youth Idea in Admin Panel
  useEffect(() => {
    if (!selectedYouthIdea) {
      setAdminTimelineUpdates([]);
      return;
    }
    
    const fetchTimeline = async () => {
      setAdminTimelineLoading(true);
      try {
        const res = await fetch(`/api/youth-ideas/${selectedYouthIdea.id}/progress`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setAdminTimelineUpdates(result.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load admin timeline updates:', err);
      } finally {
        setAdminTimelineLoading(false);
      }
    };

    fetchTimeline();
  }, [selectedYouthIdea]);

  // Authenticate user changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          // Verify with server API first
          const authCheck = await fetch('/api/admin/data', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });

          const authResult = await authCheck.json();

          if (!authCheck.ok) {
            if (authResult.isConfigError) {
              setConfigError(authResult.error);
            } else {
              setAuthError(authResult.error || t('unauthorized', { email: firebaseUser.email }));
            }
            await signOut(auth);
            setUser(null);
            setToken(null);
          } else {
            setUser(firebaseUser);
            setToken(idToken);
            setData(authResult);
            setAuthError(null);
            setConfigError(null);
          }
        } catch (error) {
          console.error('Admin verification failed:', error);
          setAuthError(t('unauthorized', { email: firebaseUser.email }));
          await signOut(auth);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [t]);

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login popup failed:', error);
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setData({ connect_requests: [], volunteers: [], feedback: [], social_videos: [], youth_ideas: [] });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update record status
  const handleUpdateStatus = async (id, type, status) => {
    if (!token) return;
    setActionLoadingId(id);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, type, status })
      });

      if (res.ok) {
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Unified Deletion Handler
  const handleDeleteRecord = async () => {
    if (!token || !deleteConfirm) return;
    const { id, type } = deleteConfirm;
    setActionLoadingId(id);
    try {
      let res;
      if (type === 'youth_idea') {
        res = await fetch(`/api/admin/youth-ideas/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        res = await fetch('/api/admin/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id, type })
        });
      }

      if (res.ok) {
        await fetchData();
        setDeleteConfirm(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Delete record error:', error);
      alert('Error deleting record');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update Youth Idea details status, progress percent, message timeline log & admin_note
  const handleSaveYouthIdeaUpdate = async (id, status, progressPercent, message, admin_note) => {
    if (!token) return;
    setUpdatingYouthIdea(true);
    try {
      const res = await fetch(`/api/admin/youth-ideas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, progressPercent, message, admin_note })
      });

      if (res.ok) {
        const result = await res.json();
        setSelectedYouthIdea(null);
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update youth idea');
      }
    } catch (error) {
      console.error('Update youth idea error:', error);
      alert('Error updating youth idea');
    } finally {
      setUpdatingYouthIdea(false);
    }
  };

  // Video Management logic
  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setFormTitleEn('');
    setFormTitleNe('');
    setFormDescEn('');
    setFormDescNe('');
    setFormVideoUrl('');
    setFormCoverUrl('');
    setFormCoverSource('auto');
    setFormThumbnailStatus('none');
    setFormErrorMsg('');
    setFormPlatform('other');
    setFormStatus('draft');
    setVideoModalOpen(true);
  };

  const handleOpenEditVideo = (video) => {
    setEditingVideo(video);
    setFormTitleEn(video.title_en || '');
    setFormTitleNe(video.title_ne || '');
    setFormDescEn(video.description_en || '');
    setFormDescNe(video.description_ne || '');
    setFormVideoUrl(video.video_url || '');
    setFormCoverUrl(video.cover_image_url || '');
    setFormCoverSource(video.cover_source || 'auto');
    setFormThumbnailStatus(video.thumbnailStatus || 'none');
    setFormErrorMsg('');
    setFormPlatform(video.platform || 'other');
    setFormStatus(video.status || 'draft');
    setVideoModalOpen(true);
  };

  const handleAutoDetectCover = async () => {
    if (!formVideoUrl) return;
    setPreviewLoading(true);
    setFormErrorMsg('');
    try {
      const res = await fetch('/api/admin/social-videos/resolve-thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: formVideoUrl })
      });

      if (res.status === 404) {
        setFormCoverUrl('');
        setFormThumbnailStatus('failed');
        setFormErrorMsg(isNepali 
          ? 'थम्बनेल सेवा उपलब्ध छैन। कृपया प्रशासकलाई सम्पर्क गर्नुहोस्।' 
          : 'Thumbnail service is not available. Please contact the administrator.'
        );
      } else if (res.ok) {
        const result = await res.json();
        if (result.success && result.thumbnailUrl) {
          setFormCoverUrl(result.thumbnailUrl);
          setFormCoverSource(result.source || 'auto');
          setFormThumbnailStatus('auto');
          setFormErrorMsg('');
          if (result.platform) setFormPlatform(result.platform);
        } else {
          setFormCoverUrl('');
          setFormThumbnailStatus('failed');
          setFormErrorMsg(result.error || (isNepali 
            ? 'यो भिडियोको लागि कुनै सार्वजनिक कभर फेला परेन।' 
            : 'No publicly accessible cover was found for this video.'
          ));
        }
      } else {
        setFormCoverUrl('');
        setFormThumbnailStatus('failed');
        setFormErrorMsg(isNepali 
          ? 'थम्बनेल पत्ता लगाउने कार्य असफल भयो।' 
          : 'Cover auto-detection failed.'
        );
      }
    } catch (err) {
      console.error(err);
      setFormCoverUrl('');
      setFormThumbnailStatus('failed');
      setFormErrorMsg(isNepali 
        ? 'कभर पत्ता लगाउने कार्यमा त्रुटि भयो।' 
        : 'Error during cover auto-detection.'
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  // Auto-detect cover image on URL paste or edit
  useEffect(() => {
    if (!formVideoUrl) {
      setFormPlatform('other');
      return;
    }
    
    // Parse platform immediately on the client-side for responsive UI
    let parsedPlatform = 'other';
    if (/youtube\.com|youtu\.be/i.test(formVideoUrl)) {
      parsedPlatform = 'youtube';
    } else if (/vimeo\.com/i.test(formVideoUrl)) {
      parsedPlatform = 'vimeo';
    } else if (/facebook\.com/i.test(formVideoUrl)) {
      parsedPlatform = 'facebook';
    } else if (/instagram\.com/i.test(formVideoUrl)) {
      parsedPlatform = 'instagram';
    } else if (/tiktok\.com/i.test(formVideoUrl)) {
      parsedPlatform = 'tiktok';
    }
    setFormPlatform(parsedPlatform);
    
    // Simple URL sanity check to avoid triggering on incomplete keystrokes
    const isUrlValid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?/i.test(formVideoUrl);
    if (!isUrlValid) return;

    // Debounce to prevent multiple hits during active manual typing
    const delayDebounceId = setTimeout(() => {
      // If editing an existing video, skip if the url is still the original saved one
      if (editingVideo && editingVideo.video_url === formVideoUrl) return;
      
      handleAutoDetectCover();
    }, 1000);

    return () => clearTimeout(delayDebounceId);
  }, [formVideoUrl]);

  const handleCustomCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadLoading(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.url) {
          setFormCoverUrl(result.url);
          setFormCoverSource('custom');
          setFormThumbnailStatus('custom');
        }
      } else {
        alert('Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!formTitleEn || !formTitleNe || !formDescEn || !formDescNe || !formVideoUrl) {
      return alert(isNepali ? 'कृपया आवश्यक सबै क्षेत्रहरू भर्नुहोस्' : 'Please fill in all required fields');
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/social-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingVideo ? editingVideo.id : undefined,
          title_en: formTitleEn,
          title_ne: formTitleNe,
          description_en: formDescEn,
          description_ne: formDescNe,
          video_url: formVideoUrl,
          cover_image_url: formCoverUrl,
          cover_source: formCoverSource,
          thumbnailStatus: formThumbnailStatus,
          platform: formPlatform,
          status: formStatus
        })
      });

      if (res.ok) {
        await fetchData();
        setVideoModalOpen(false);
      } else {
        const result = await res.json();
        alert(result.error || 'Failed to save video');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving video');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRefreshCover = async (video) => {
    setActionLoadingId(video.id);
    try {
      const res = await fetch('/api/admin/social-videos/resolve-thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: video.video_url })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.thumbnailUrl) {
          const { thumbnailUrl, platform, source } = result;
          
          const updateRes = await fetch('/api/admin/social-videos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              id: video.id,
              cover_image_url: thumbnailUrl || '',
              cover_source: source || 'auto',
              thumbnailStatus: 'auto',
              platform: platform || video.platform
            })
          });

          if (updateRes.ok) {
            await fetchData();
            alert(isNepali ? 'भिडियो कभर सफलतापूर्वक रिफ्रेस भयो।' : 'Video cover successfully refreshed.');
          } else {
            alert(isNepali ? 'कभर सुरक्षित गर्न सकिएन।' : 'Failed to save updated cover.');
          }
        } else {
          // Update db with failed status if no cover was resolved
          await fetch('/api/admin/social-videos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              id: video.id,
              cover_image_url: '',
              cover_source: 'auto',
              thumbnailStatus: 'failed'
            })
          });
          await fetchData();
          alert(isNepali ? 'कभर पत्ता लाग्न सकेन।' : 'Unable to auto-detect cover image.');
        }
      } else {
        alert(isNepali ? 'कभर रिफ्रेस गर्न असफल भयो।' : 'Cover refresh failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error refreshing cover');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefreshAllCovers = async () => {
    if (!data.social_videos || data.social_videos.length === 0) return;
    if (!confirm(isNepali ? 'के तपाईं सबै भिडियो कभरहरू रिफ्रेस गर्न चाहनुहुन्छ?' : 'Are you sure you want to refresh all video covers?')) return;
    
    setDataLoading(true);
    let successCount = 0;
    
    for (const video of data.social_videos) {
      try {
        const res = await fetch('/api/admin/social-videos/resolve-thumbnail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: video.video_url })
        });
        
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.thumbnailUrl) {
            const { thumbnailUrl, platform, source } = result;
            
            await fetch('/api/admin/social-videos', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                id: video.id,
                cover_image_url: thumbnailUrl || '',
                cover_source: source || 'auto',
                thumbnailStatus: 'auto',
                platform: platform || video.platform
              })
            });
            successCount++;
          } else {
            await fetch('/api/admin/social-videos', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                id: video.id,
                cover_image_url: '',
                cover_source: 'auto',
                thumbnailStatus: 'failed'
              })
            });
          }
        }
      } catch (err) {
        console.error(`Error refreshing cover for video ${video.id}:`, err);
      }
    }
    
    await fetchData();
    setDataLoading(false);
    alert(isNepali 
      ? `सफलतापूर्वक ${successCount} कभर(हरू) रिफ्रेस भयो।` 
      : `Successfully refreshed ${successCount} cover(s).`
    );
  };

  // Translate Status helper
  const translateStatus = (status) => {
    switch (status) {
      case 'pending': return t('status.pending');
      case 'contacted': return t('status.contacted');
      case 'approved': return t('status.approved');
      case 'rejected': return t('status.rejected');
      case 'read': return t('status.read');
      case 'unread': return t('status.unread');
      case 'published': return t('published');
      case 'draft': return t('draft');
      default: return status;
    }
  };

  // Status Badge Color Helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'contacted': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'approved': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'read': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'unread': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'published': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default: return 'bg-dark-800 text-dark-400';
    }
  };

  // Render Login Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
        <RefreshCw className="animate-spin text-primary-500 mb-4" size={32} />
        <p className="text-dark-400 text-sm">{isNepali ? 'लोड हुँदैछ...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-dark-900 border border-primary-900/40 rounded-sm p-8 shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-primary-950/50 border border-primary-700/50 rounded-sm flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} className="text-primary-500" />
          </div>

          <h2 className="text-white text-2xl font-bold font-display uppercase tracking-wide mb-2">
            {t('loginTitle')}
          </h2>
          <p className="text-dark-400 text-sm mb-8 leading-relaxed">
            {t('loginSubtitle')}
          </p>

          {authError && (
            <div className="mb-6 flex items-start gap-2 text-left p-4 bg-red-950/40 border border-red-800/50 rounded-sm text-red-400 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {configError && (
            <div className="mb-6 flex flex-col items-start text-left p-4 bg-yellow-950/40 border border-yellow-800/50 rounded-sm text-yellow-500 text-xs gap-1.5 font-mono">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-yellow-400">
                <AlertCircle size={12} />
                <span>Configuration Warning</span>
              </div>
              <p className="font-sans leading-relaxed">
                The Firebase Service Account credentials are not configured on the server. Please add <code>FIREBASE_SERVICE_ACCOUNT</code> to your <code>.env.local</code> file and restart Next.js.
              </p>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full btn-primary justify-center py-3.5 text-sm uppercase tracking-widest flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.997 0-.746-.08-1.32-.176-1.888H12.24z"/>
            </svg>
            <span>{t('loginBtn')}</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // Loaded database sizes
  const totalConnect = data.connect_requests?.length || 0;
  const totalVolunteers = data.volunteers?.length || 0;
  const totalFeedback = data.feedback?.length || 0;
  const totalVideos = data.social_videos?.length || 0;
  const totalYouthIdeas = data.youth_ideas?.length || 0;

  // Filter lists based on tab
  const recentSubmissions = [
    ...(data.connect_requests || []).map(r => ({ ...r, type: 'connect', typeLabel: t('tabs.connect') })),
    ...(data.volunteers || []).map(v => ({ ...v, type: 'volunteer', typeLabel: t('tabs.volunteers') })),
    ...(data.feedback || []).map(f => ({ ...f, type: 'feedback', typeLabel: t('tabs.feedback') })),
    ...(data.youth_ideas || []).map(y => ({ ...y, type: 'youth_idea', typeLabel: isNepali ? 'युवा विचार' : 'Youth Idea' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="container-custom">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-900/20 pb-6 mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold font-display uppercase tracking-wider mb-1">
              {t('title')}
            </h1>
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{user.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={dataLoading}
              className="p-2 border border-primary-900/30 rounded-sm hover:bg-primary-900/10 text-dark-400 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={dataLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="btn-outline text-xs uppercase tracking-widest px-4 py-2 flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>{t('logoutBtn')}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu trigger header (visible < 1024px) */}
        <div className="lg:hidden flex items-center justify-between bg-dark-900 border border-primary-900/20 px-4 py-3 rounded-sm mb-6">
          <button
            onClick={() => setIsAdminMenuOpen(true)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary-400 hover:text-white"
          >
            <Menu size={18} />
            <span>
              {activeTab === 'videos' 
                ? t('socialVideos') 
                : t('tabs.' + activeTab)}
            </span>
          </button>
          
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-primary-800/60 rounded-sm text-xs font-bold text-primary-400 hover:text-primary-300 hover:bg-primary-900/20 transition-all duration-200"
          >
            <Globe size={12} />
            <span>{locale === 'ne' ? 'EN' : 'नेपाली'}</span>
          </button>
        </div>

        {/* Mobile Admin Navigation Drawer Overlay */}
        <AnimatePresence>
          {isAdminMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsAdminMenuOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-[290px] bg-dark-950 border-r border-primary-900/40 z-50 lg:hidden p-4 flex flex-col justify-between overflow-y-auto"
              >
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-primary-900/30">
                    <span className="text-primary-400 text-xs font-bold tracking-widest uppercase">
                      {isNepali ? 'प्रशासक मेनु' : 'ADMIN MENU'}
                    </span>
                    <button
                      onClick={() => setIsAdminMenuOpen(false)}
                      className="w-8 h-8 flex items-center justify-center text-dark-300 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Tabs List */}
                  <div className="space-y-1.5">
                    {[
                      { id: 'dashboard', label: t('tabs.dashboard'), icon: LayoutDashboard },
                      { id: 'connect', label: t('tabs.connect'), icon: UserCheck },
                      { id: 'volunteers', label: t('tabs.volunteers'), icon: Users },
                      { id: 'feedback', label: t('tabs.feedback'), icon: MessageSquare },
                      { id: 'videos', label: t('socialVideos'), icon: Play },
                      { id: 'youth_ideas', label: isNepali ? 'युवा विचार' : 'Youth Ideas', icon: Lightbulb }
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsAdminMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-sm transition-all ${
                            activeTab === tab.id 
                              ? 'bg-primary-700 text-white shadow-red-glow' 
                              : 'text-dark-400 hover:text-white hover:bg-primary-900/10'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-4 border-t border-primary-900/30 space-y-3">
                  <button
                    onClick={() => { toggleLocale(); setIsAdminMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-primary-700/50 rounded-sm text-primary-400 hover:bg-primary-900/20 transition-all duration-200"
                  >
                    <Globe size={14} />
                    <span className="text-xs font-bold tracking-widest">
                      {locale === 'ne' ? 'ENGLISH' : 'नेपाली'}
                    </span>
                  </button>

                  <button
                    onClick={() => { handleLogout(); setIsAdminMenuOpen(false); }}
                    className="w-full btn-outline justify-center py-3 text-xs uppercase tracking-widest flex items-center gap-1.5 border-red-950 hover:bg-red-900/10 text-red-400"
                  >
                    <LogOut size={13} />
                    <span>{t('logoutBtn')}</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Tab Controls & Workspace Grid */}
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          
          {/* Desktop Sidebar (hidden < 1024px) */}
          <div className="hidden lg:block lg:col-span-1 space-y-1 bg-dark-900/50 border border-primary-900/20 p-2 rounded-sm">
            {[
              { id: 'dashboard', label: t('tabs.dashboard'), icon: LayoutDashboard },
              { id: 'connect', label: t('tabs.connect'), icon: UserCheck },
              { id: 'volunteers', label: t('tabs.volunteers'), icon: Users },
              { id: 'feedback', label: t('tabs.feedback'), icon: MessageSquare },
              { id: 'videos', label: t('socialVideos'), icon: Play },
              { id: 'youth_ideas', label: isNepali ? 'युवा विचार' : 'Youth Ideas', icon: Lightbulb }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-all duration-250 ${
                    activeTab === tab.id 
                      ? 'bg-primary-700 text-white shadow-red-glow font-semibold' 
                      : 'text-dark-400 hover:text-white hover:bg-primary-900/10'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main workspace panels */}
          <div className="lg:col-span-4 bg-dark-900 border border-primary-900/30 rounded-sm p-4 sm:p-8 min-h-[500px]">
            
            {/* Tab 1: Dashboard Panel */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats row (responsive 1-2-4 columns mapping) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: t('totalConnect'), value: totalConnect, icon: UserCheck, tab: 'connect' },
                    { label: t('totalVolunteers'), value: totalVolunteers, icon: Users, tab: 'volunteers' },
                    { label: t('totalFeedback'), value: totalFeedback, icon: MessageSquare, tab: 'feedback' },
                    { label: t('totalVideos'), value: totalVideos, icon: Play, tab: 'videos' },
                    { label: isNepali ? 'युवा विचार' : 'Youth Ideas', value: totalYouthIdeas, icon: Lightbulb, tab: 'youth_ideas' }
                  ].map(stat => (
                    <div 
                      key={stat.label}
                      onClick={() => setActiveTab(stat.tab)}
                      className="bg-dark-950 border border-primary-900/20 hover:border-primary-800/40 p-6 rounded-sm cursor-pointer transition-all hover:translate-y-[-2px]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-dark-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                        <stat.icon size={18} className="text-primary-500" />
                      </div>
                      <span className="text-white text-3xl font-bold font-display">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Submissions Feed */}
                <div>
                  <h3 className="text-white text-lg font-bold uppercase tracking-wider font-display mb-4">
                    {t('recentSubmissions')}
                  </h3>
                  <div className="space-y-3">
                    {recentSubmissions.length === 0 ? (
                      <p className="text-dark-500 text-sm italic">{t('noSubmissions')}</p>
                    ) : (
                      recentSubmissions.map(item => (
                        <div 
                          key={item.id} 
                          className="bg-dark-950 border border-primary-900/10 p-4 rounded-sm flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium text-sm">{item.name}</span>
                              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-primary-900/35 border border-primary-800/40 text-primary-400 rounded-sm">
                                {item.typeLabel}
                              </span>
                            </div>
                            <p className="text-dark-500 text-xs">
                              {new Date(item.createdAt).toLocaleString(isNepali ? 'ne-NP' : 'en-US')}
                            </p>
                          </div>
                          
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(item.status)}`}>
                              {translateStatus(item.status)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Connect Requests Panel */}
            {activeTab === 'connect' && (
              <div className="space-y-6">
                <h3 className="text-white text-xl font-bold font-display uppercase tracking-wider mb-2">
                  {t('tabs.connect')}
                </h3>
                
                {/* Desktop Table View (>= 768px) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-primary-900/30 text-dark-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">{t('table.name')}</th>
                        <th className="py-3 px-4">{t('table.palika')}</th>
                        <th className="py-3 px-4">{t('table.ward')}</th>
                        <th className="py-3 px-4">{t('table.contact')}</th>
                        <th className="py-3 px-4">{t('table.date')}</th>
                        <th className="py-3 px-4">{t('table.status')}</th>
                        <th className="py-3 px-4 text-right">{t('table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-900/10">
                      {data.connect_requests?.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-dark-500 italic">
                            {t('noSubmissions')}
                          </td>
                        </tr>
                      ) : (
                        data.connect_requests?.map(row => (
                          <tr key={row.id} className="hover:bg-primary-900/5 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-white">{row.name}</td>
                            <td className="py-3.5 px-4 text-dark-300">{row.palika}</td>
                            <td className="py-3.5 px-4 text-dark-300">{row.ward}</td>
                            <td className="py-3.5 px-4 text-dark-300">{row.contact}</td>
                            <td className="py-3.5 px-4 text-dark-400 text-xs">
                              {new Date(row.createdAt).toLocaleDateString(isNepali ? 'ne-NP' : 'en-US')}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(row.status)}`}>
                                {translateStatus(row.status)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {row.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(row.id, 'connect', 'contacted')}
                                    disabled={actionLoadingId === row.id}
                                    className="p-1 border border-blue-900/50 hover:bg-blue-900/20 text-blue-400 rounded-sm transition-all"
                                    title={t('actions.markContacted')}
                                  >
                                    <Clock size={14} />
                                  </button>
                                )}
                                {row.status !== 'approved' && (
                                  <button
                                    onClick={() => handleUpdateStatus(row.id, 'connect', 'approved')}
                                    disabled={actionLoadingId === row.id}
                                    className="p-1 border border-green-900/50 hover:bg-green-900/20 text-green-400 rounded-sm transition-all"
                                    title={t('actions.approve')}
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                                {row.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleUpdateStatus(row.id, 'connect', 'rejected')}
                                    disabled={actionLoadingId === row.id}
                                    className="p-1 border border-red-900/50 hover:bg-red-900/20 text-red-400 rounded-sm transition-all"
                                    title={t('actions.reject')}
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setDeleteConfirm({ id: row.id, type: 'connect' })}
                                  disabled={actionLoadingId === row.id}
                                  className="p-1 border border-red-950 bg-red-950/20 hover:bg-red-900/40 text-red-500 rounded-sm transition-all"
                                  title={t('delete')}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View (< 768px) */}
                <div className="md:hidden space-y-4">
                  {data.connect_requests?.length === 0 ? (
                    <p className="py-8 text-center text-dark-500 italic border border-primary-900/10 rounded-sm bg-dark-950">
                      {t('noSubmissions')}
                    </p>
                  ) : (
                    data.connect_requests?.map(row => (
                      <div key={row.id} className="bg-dark-950 border border-primary-900/20 p-4 rounded-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-sm">{row.name}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(row.status)}`}>
                            {translateStatus(row.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-dark-300 border-t border-primary-900/5 pt-2">
                          <div>
                            <span className="text-dark-500 font-semibold block uppercase tracking-wider text-[8px] mb-0.5">Palika</span>
                            <span className="text-white">{row.palika}</span>
                          </div>
                          <div>
                            <span className="text-dark-500 font-semibold block uppercase tracking-wider text-[8px] mb-0.5">Ward</span>
                            <span className="text-white">{row.ward}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-dark-500 font-semibold block uppercase tracking-wider text-[8px] mb-0.5">Contact</span>
                            <span className="text-white">{row.contact}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-dark-500 font-semibold block uppercase tracking-wider text-[8px] mb-0.5">Date Submitted</span>
                            <span className="text-dark-400">
                              {new Date(row.createdAt).toLocaleString(isNepali ? 'ne-NP' : 'en-US')}
                            </span>
                          </div>
                        </div>

                        {/* Actions block with 44px min touch heights */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-primary-900/10">
                          {row.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(row.id, 'connect', 'contacted')}
                              disabled={actionLoadingId === row.id}
                              className="p-2.5 border border-blue-900/50 hover:bg-blue-900/20 text-blue-400 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                              title={t('actions.markContacted')}
                            >
                              <Clock size={15} />
                            </button>
                          )}
                          {row.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(row.id, 'connect', 'approved')}
                              disabled={actionLoadingId === row.id}
                              className="p-2.5 border border-green-900/50 hover:bg-green-900/20 text-green-400 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                              title={t('actions.approve')}
                            >
                              <Check size={15} />
                            </button>
                          )}
                          {row.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(row.id, 'connect', 'rejected')}
                              disabled={actionLoadingId === row.id}
                              className="p-2.5 border border-red-900/50 hover:bg-red-900/20 text-red-400 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                              title={t('actions.reject')}
                            >
                              <X size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm({ id: row.id, type: 'connect' })}
                            disabled={actionLoadingId === row.id}
                            className="p-2.5 border border-red-955 bg-red-950/20 hover:bg-red-900/40 text-red-500 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                            title={t('delete')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Volunteers Panel */}
            {activeTab === 'volunteers' && (
              <div className="space-y-6">
                <h3 className="text-white text-xl font-bold font-display uppercase tracking-wider mb-2">
                  {t('tabs.volunteers')}
                </h3>
                <div className="space-y-4">
                  {data.volunteers?.length === 0 ? (
                    <p className="py-8 text-center text-dark-500 italic border border-primary-900/10 rounded-sm">
                      {t('noSubmissions')}
                    </p>
                  ) : (
                    data.volunteers?.map(vol => (
                      <div 
                        key={vol.id}
                        className="bg-dark-950 border border-primary-900/20 p-6 rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-primary-800/40 transition-all"
                      >
                        <div className="space-y-3 flex-grow">
                          {/* Name + Status */}
                          <div className="flex items-center gap-3">
                            <h4 className="text-white text-lg font-bold">{vol.name}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getStatusColor(vol.status)}`}>
                              {translateStatus(vol.status)}
                            </span>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-dark-300">
                            <div>
                              <span className="text-dark-500 font-medium mr-1.5">Phone:</span>
                              <span className="text-white">{vol.phone}</span>
                            </div>
                            <div>
                              <span className="text-dark-500 font-medium mr-1.5">Email:</span>
                              <span className="text-white">{vol.email || '—'}</span>
                            </div>
                            <div>
                              <span className="text-dark-500 font-medium mr-1.5">Village:</span>
                              <span className="text-white">{vol.village}</span>
                            </div>
                            <div>
                              <span className="text-dark-500 font-medium mr-1.5">Submitted:</span>
                              <span className="text-white">{new Date(vol.createdAt).toLocaleString(isNepali ? 'ne-NP' : 'en-US')}</span>
                            </div>
                          </div>

                          {/* Interests Area */}
                          {vol.interests && (
                            <div className="text-xs">
                              <span className="text-dark-500 font-medium mr-1.5">{t('table.interests')}:</span>
                              <span className="text-primary-400 font-semibold">{vol.interests}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions block */}
                        <div className="flex md:flex-col gap-2 flex-wrap items-center w-full md:w-36">
                          {vol.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(vol.id, 'volunteer', 'approved')}
                              disabled={actionLoadingId === vol.id}
                              className="btn-outline border-green-900/50 hover:bg-green-900/20 text-green-400 text-xs px-3 py-1.5 w-full flex items-center justify-center gap-1"
                            >
                              <Check size={12} />
                              <span>{t('actions.approve')}</span>
                            </button>
                          )}
                          {vol.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(vol.id, 'volunteer', 'contacted')}
                              disabled={actionLoadingId === vol.id}
                              className="btn-outline border-blue-900/50 hover:bg-blue-900/20 text-blue-400 text-xs px-3 py-1.5 w-full flex items-center justify-center gap-1"
                            >
                              <Clock size={12} />
                              <span>{t('actions.markContacted')}</span>
                            </button>
                          )}
                          {vol.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(vol.id, 'volunteer', 'rejected')}
                              disabled={actionLoadingId === vol.id}
                              className="btn-outline border-red-900/50 hover:bg-red-900/20 text-red-400 text-xs px-3 py-1.5 w-full flex items-center justify-center gap-1"
                            >
                              <X size={12} />
                              <span>{t('actions.reject')}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm({ id: vol.id, type: 'volunteer' })}
                            disabled={actionLoadingId === vol.id}
                            className="btn-outline border-red-950 bg-red-950/20 hover:bg-red-900/40 text-red-500 text-xs px-3 py-1.5 w-full flex items-center justify-center gap-1"
                          >
                            <Trash2 size={12} />
                            <span>{t('delete')}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Feedback Panel */}
            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <h3 className="text-white text-xl font-bold font-display uppercase tracking-wider mb-2">
                  {t('tabs.feedback')}
                </h3>
                <div className="space-y-4">
                  {data.feedback?.length === 0 ? (
                    <p className="py-8 text-center text-dark-500 italic border border-primary-900/10 rounded-sm">
                      {t('noSubmissions')}
                    </p>
                  ) : (
                    data.feedback?.map(feed => (
                      <div 
                        key={feed.id}
                        className="bg-dark-950 border border-primary-900/20 p-6 rounded-sm flex flex-col justify-between gap-4 hover:border-primary-800/40 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-primary-900/10 pb-3">
                          <div className="space-y-0.5">
                            <h4 className="text-white font-bold text-base">{feed.name}</h4>
                            <p className="text-dark-400 text-xs">{feed.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-dark-500 text-xs">
                              {new Date(feed.createdAt).toLocaleString(isNepali ? 'ne-NP' : 'en-US')}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getStatusColor(feed.status)}`}>
                              {translateStatus(feed.status)}
                            </span>
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="text-dark-300 text-sm leading-relaxed whitespace-pre-line bg-dark-900/40 p-4 rounded-sm border border-primary-900/5">
                          {feed.message}
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-2">
                          {feed.status === 'unread' ? (
                            <button
                              onClick={() => handleUpdateStatus(feed.id, 'feedback', 'read')}
                              disabled={actionLoadingId === feed.id}
                              className="btn-outline border-green-900/50 hover:bg-green-900/20 text-green-400 text-xs px-3.5 py-1.5 flex items-center gap-1"
                            >
                              <CheckCheck size={12} />
                              <span>{t('actions.markRead')}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(feed.id, 'feedback', 'unread')}
                              disabled={actionLoadingId === feed.id}
                              className="btn-outline border-yellow-900/50 hover:bg-yellow-900/20 text-yellow-400 text-xs px-3.5 py-1.5 flex items-center gap-1"
                            >
                              <Eye size={12} />
                              <span>{t('actions.markUnread')}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm({ id: feed.id, type: 'feedback' })}
                            disabled={actionLoadingId === feed.id}
                            className="btn-outline border-red-950 bg-red-950/20 hover:bg-red-900/40 text-red-500 text-xs px-3.5 py-1.5 flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            <span>{t('delete')}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 5: Social Work Videos Panel */}
            {activeTab === 'videos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-white text-xl font-bold font-display uppercase tracking-wider">
                    {t('socialVideos')}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleRefreshAllCovers}
                      className="btn-outline border-primary-900/60 hover:bg-primary-900/10 text-primary-400 text-xs px-4 py-2.5 uppercase tracking-widest font-bold flex items-center gap-1.5 min-h-[44px]"
                    >
                      <RefreshCw size={12} />
                      <span>{isNepali ? 'सबै कभर रिफ्रेस' : 'Refresh All Covers'}</span>
                    </button>
                    <button
                      onClick={handleOpenAddVideo}
                      className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-widest shadow-red-glow font-bold min-h-[44px]"
                    >
                      <Plus size={14} />
                      <span>{t('addVideo')}</span>
                    </button>
                  </div>
                </div>

                {/* Desktop Table View (>= 768px) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-primary-900/30 text-dark-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Cover</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Platform</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-900/10">
                      {data.social_videos?.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-dark-500 italic">
                            {t('noSubmissions')}
                          </td>
                        </tr>
                      ) : (
                        data.social_videos?.map(row => {
                          const title = isNepali ? row.title_ne : row.title_en;
                          return (
                            <tr key={row.id} className="hover:bg-primary-900/5 transition-colors">
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div className="w-20 aspect-video bg-dark-950 border border-primary-950 rounded-sm overflow-hidden flex items-center justify-center relative">
                                    {row.cover_image_url ? (
                                      <img
                                        src={row.cover_image_url}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-[10px] text-red-500 font-bold uppercase p-1 text-center bg-red-950/20 w-full h-full">
                                        <span>No cover</span>
                                      </div>
                                    )}
                                  </div>
                                  {(!row.cover_image_url || row.thumbnailStatus === 'failed') && (
                                    <button
                                      onClick={() => handleOpenEditVideo(row)}
                                      className="text-[9px] uppercase font-bold tracking-wider text-primary-400 hover:text-primary-300 block hover:underline"
                                    >
                                      [Upload Cover]
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium text-white max-w-[200px] truncate" title={title}>
                                {title}
                              </td>
                              <td className="py-3 px-4 text-dark-300 uppercase text-xs tracking-wider">
                                {row.platform}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(row.status)}`}>
                                  {translateStatus(row.status)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-dark-400 text-xs">
                                {new Date(row.createdAt).toLocaleDateString(isNepali ? 'ne-NP' : 'en-US')}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {row.status === 'draft' ? (
                                    <button
                                      onClick={() => handleUpdateStatus(row.id, 'social_video', 'published')}
                                      disabled={actionLoadingId === row.id}
                                      className="p-1 border border-green-900/50 hover:bg-green-900/20 text-green-400 rounded-sm transition-all"
                                      title={isNepali ? 'प्रकाशित गर्नुहोस्' : 'Publish'}
                                    >
                                      <Check size={14} />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateStatus(row.id, 'social_video', 'draft')}
                                      disabled={actionLoadingId === row.id}
                                      className="p-1 border border-yellow-900/50 hover:bg-yellow-900/20 text-yellow-400 rounded-sm transition-all"
                                      title={isNepali ? 'ड्राफ्टमा राख्नुहोस्' : 'Keep Draft'}
                                    >
                                      <Clock size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleRefreshCover(row)}
                                    disabled={actionLoadingId !== null}
                                    className="p-1 border border-primary-900/50 hover:bg-primary-900/20 text-primary-400 rounded-sm transition-all"
                                    title={isNepali ? 'कभर रिफ्रेस गर्नुहोस्' : 'Refresh Cover'}
                                  >
                                    <RefreshCw size={14} className={actionLoadingId === row.id ? 'animate-spin' : ''} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditVideo(row)}
                                    disabled={actionLoadingId === row.id}
                                    className="p-1 border border-primary-900/50 hover:bg-primary-900/20 text-primary-400 rounded-sm transition-all"
                                    title={t('editVideo')}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ id: row.id, type: 'social_video' })}
                                    disabled={actionLoadingId === row.id}
                                    className="p-1 border border-red-955 bg-red-950/20 hover:bg-red-900/40 text-red-500 rounded-sm transition-all"
                                    title={t('delete')}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View (< 768px) */}
                <div className="md:hidden space-y-4">
                  {data.social_videos?.length === 0 ? (
                    <p className="py-8 text-center text-dark-500 italic border border-primary-900/10 rounded-sm bg-dark-950">
                      {t('noSubmissions')}
                    </p>
                  ) : (
                    data.social_videos?.map(row => {
                      const title = isNepali ? row.title_ne : row.title_en;
                      return (
                        <div key={row.id} className="bg-dark-950 border border-primary-900/20 p-4 rounded-sm space-y-3">
                          <div className="flex gap-3">
                            <div className="w-20 aspect-video bg-dark-950 border border-primary-950 rounded-sm overflow-hidden flex items-center justify-center relative flex-shrink-0">
                              {row.cover_image_url ? (
                                <img
                                  src={row.cover_image_url}
                                  alt={title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-[8px] text-red-500 font-bold uppercase p-1 text-center bg-red-950/20 w-full h-full">
                                  <span>No cover</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 min-w-0 flex-grow">
                              <h4 className="text-white font-bold text-sm truncate" title={title}>{title}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase tracking-wider text-dark-400 font-semibold">{row.platform}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(row.status)}`}>
                                  {translateStatus(row.status)}
                                </span>
                              </div>
                              {(!row.cover_image_url || row.thumbnailStatus === 'failed') && (
                                <button
                                  onClick={() => handleOpenEditVideo(row)}
                                  className="text-[9px] uppercase font-bold tracking-wider text-primary-400 hover:text-primary-300 block hover:underline"
                                >
                                  [Upload Cover]
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-[11px] text-dark-400 border-t border-primary-900/5 pt-2 flex justify-between items-center">
                            <span>Created: {new Date(row.createdAt).toLocaleDateString(isNepali ? 'ne-NP' : 'en-US')}</span>
                          </div>

                          {/* Actions block with 44px min touch heights */}
                          <div className="flex justify-end gap-2 pt-2 border-t border-primary-900/10">
                            {row.status === 'draft' ? (
                              <button
                                onClick={() => handleUpdateStatus(row.id, 'social_video', 'published')}
                                disabled={actionLoadingId === row.id}
                                className="p-2.5 border border-green-900/50 hover:bg-green-900/20 text-green-400 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                                title={isNepali ? 'प्रकाशित गर्नुहोस्' : 'Publish'}
                              >
                                <Check size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(row.id, 'social_video', 'draft')}
                                disabled={actionLoadingId === row.id}
                                className="p-2.5 border border-yellow-900/50 hover:bg-yellow-900/20 text-yellow-400 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                                title={isNepali ? 'ड्राफ्टमा राख्नुहोस्' : 'Keep Draft'}
                              >
                                <Clock size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => handleRefreshCover(row)}
                              disabled={actionLoadingId !== null}
                              className="p-2.5 border border-primary-900/50 hover:bg-primary-900/20 text-primary-400 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                              title={isNepali ? 'कभर रिफ्रेस गर्नुहोस्' : 'Refresh Cover'}
                            >
                              <RefreshCw size={15} className={actionLoadingId === row.id ? 'animate-spin' : ''} />
                            </button>
                            <button
                              onClick={() => handleOpenEditVideo(row)}
                              disabled={actionLoadingId === row.id}
                              className="p-2.5 border border-primary-900/50 hover:bg-primary-900/20 text-primary-400 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                              title={t('editVideo')}
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ id: row.id, type: 'social_video' })}
                              disabled={actionLoadingId === row.id}
                              className="p-2.5 border border-red-955 bg-red-950/20 hover:bg-red-900/40 text-red-500 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                              title={t('delete')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Tab 6: Youth Ideas Panel */}
            {activeTab === 'youth_ideas' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-white text-xl font-bold uppercase tracking-wide font-display">
                    {isNepali ? 'युवा विचार व्यवस्थापन' : 'Youth Ideas Management'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400">
                      {isNepali 
                        ? `${(data.youth_ideas || []).filter(yi => {
                            const searchLower = youthIdeasSearch.toLowerCase();
                            const matchesSearch = (yi.name || '').toLowerCase().includes(searchLower) || (yi.idea || '').toLowerCase().includes(searchLower) || (yi.location || '').toLowerCase().includes(searchLower);
                            const matchesStatus = youthIdeasStatusFilter === 'all' || yi.status === youthIdeasStatusFilter;
                            const matchesCategory = youthIdeasCategoryFilter === 'all' || yi.category === youthIdeasCategoryFilter;
                            const matchesLang = youthIdeasLangFilter === 'all' || yi.language === youthIdeasLangFilter;
                            return matchesSearch && matchesStatus && matchesCategory && matchesLang;
                          }).length} वटा विचारहरू भेटिए` 
                        : `${(data.youth_ideas || []).filter(yi => {
                            const searchLower = youthIdeasSearch.toLowerCase();
                            const matchesSearch = (yi.name || '').toLowerCase().includes(searchLower) || (yi.idea || '').toLowerCase().includes(searchLower) || (yi.location || '').toLowerCase().includes(searchLower);
                            const matchesStatus = youthIdeasStatusFilter === 'all' || yi.status === youthIdeasStatusFilter;
                            const matchesCategory = youthIdeasCategoryFilter === 'all' || yi.category === youthIdeasCategoryFilter;
                            const matchesLang = youthIdeasLangFilter === 'all' || yi.language === youthIdeasLangFilter;
                            return matchesSearch && matchesStatus && matchesCategory && matchesLang;
                          }).length} ideas found`}
                    </span>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-dark-950 p-4 rounded-sm border border-primary-900/10">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={youthIdeasSearch}
                      onChange={(e) => setYouthIdeasSearch(e.target.value)}
                      placeholder={isNepali ? 'खोज्नुहोस् (नाम, विचार, ठाउँ...)' : 'Search (name, idea, location...)'}
                      className={`w-full bg-dark-900 border border-primary-900/40 rounded-sm px-3 py-2.5 text-xs text-white placeholder:text-dark-600 focus:outline-none focus:border-primary-650 min-h-[44px] ${isNepali ? 'font-nepali' : ''}`}
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={youthIdeasStatusFilter}
                      onChange={(e) => setYouthIdeasStatusFilter(e.target.value)}
                      className={`w-full bg-dark-900 border border-primary-900/40 rounded-sm px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary-650 min-h-[44px] ${isNepali ? 'font-nepali' : ''}`}
                    >
                      <option value="all">{isNepali ? 'सबै अवस्थाहरू' : 'All Statuses'}</option>
                      <option value="pending">{isNepali ? 'विचाराधीन' : 'Pending'}</option>
                      <option value="under_review">{isNepali ? 'समीक्षाधीन' : 'Under Review'}</option>
                      <option value="approved">{isNepali ? 'स्वीकृत' : 'Approved'}</option>
                      <option value="implemented">{isNepali ? 'कार्यान्वित' : 'Implemented'}</option>
                      <option value="rejected">{isNepali ? 'अस्वीकृत' : 'Rejected'}</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select
                      value={youthIdeasCategoryFilter}
                      onChange={(e) => setYouthIdeasCategoryFilter(e.target.value)}
                      className={`w-full bg-dark-900 border border-primary-900/40 rounded-sm px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary-650 min-h-[44px] ${isNepali ? 'font-nepali' : ''}`}
                    >
                      <option value="all">{isNepali ? 'सबै श्रेणीहरू' : 'All Categories'}</option>
                      <option value="education">{isNepali ? 'शिक्षा' : 'Education'}</option>
                      <option value="health">{isNepali ? 'स्वास्थ्य' : 'Health'}</option>
                      <option value="roads">{isNepali ? 'सडक र यातायात' : 'Roads & Transport'}</option>
                      <option value="employment">{isNepali ? 'रोजगार' : 'Employment'}</option>
                      <option value="environment">{isNepali ? 'वातावरण' : 'Environment'}</option>
                      <option value="technology">{isNepali ? 'प्रविधि' : 'Technology'}</option>
                      <option value="women">{isNepali ? 'महिला अधिकार' : "Women's Rights"}</option>
                      <option value="agriculture">{isNepali ? 'कृषि' : 'Agriculture'}</option>
                      <option value="other">{isNepali ? 'अन्य' : 'Other'}</option>
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <select
                      value={youthIdeasLangFilter}
                      onChange={(e) => setYouthIdeasLangFilter(e.target.value)}
                      className={`w-full bg-dark-900 border border-primary-900/40 rounded-sm px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary-650 min-h-[44px] ${isNepali ? 'font-nepali' : ''}`}
                    >
                      <option value="all">{isNepali ? 'सबै भाषाहरू' : 'All Languages'}</option>
                      <option value="en">{isNepali ? 'अंग्रेजी' : 'English'}</option>
                      <option value="ne">{isNepali ? 'नेपाली' : 'Nepali'}</option>
                    </select>
                  </div>
                </div>

                {/* Data View */}
                {(data.youth_ideas || []).filter(yi => {
                  const searchLower = youthIdeasSearch.toLowerCase();
                  const matchesSearch = (yi.name || '').toLowerCase().includes(searchLower) || (yi.idea || '').toLowerCase().includes(searchLower) || (yi.location || '').toLowerCase().includes(searchLower) || (yi.contact_number || '').toLowerCase().includes(searchLower);
                  const matchesStatus = youthIdeasStatusFilter === 'all' || yi.status === youthIdeasStatusFilter;
                  const matchesCategory = youthIdeasCategoryFilter === 'all' || yi.category === youthIdeasCategoryFilter;
                  const matchesLang = youthIdeasLangFilter === 'all' || yi.language === youthIdeasLangFilter;
                  return matchesSearch && matchesStatus && matchesCategory && matchesLang;
                }).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-primary-900/20 rounded-sm bg-dark-950/30">
                    <p className={`text-dark-500 text-sm ${isNepali ? 'font-nepali' : ''}`}>
                      {isNepali ? 'कुनै युवा विचारहरू फेला परेन।' : 'No youth ideas found.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table view (hidden < 768px) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-primary-900/30 text-dark-400 font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">{isNepali ? 'नाम' : 'Name'}</th>
                            <th className="py-3 px-4">{isNepali ? 'श्रेणी' : 'Category'}</th>
                            <th className="py-3 px-4 w-1/3">{isNepali ? 'विचार' : 'Idea'}</th>
                            <th className="py-3 px-4">{isNepali ? 'ठाउँ' : 'Location'}</th>
                            <th className="py-3 px-4">{isNepali ? 'सम्पर्क' : 'Contact'}</th>
                            <th className="py-3 px-4">{isNepali ? 'अवस्था' : 'Status'}</th>
                            <th className="py-3 px-4 text-right">{isNepali ? 'कार्य' : 'Actions'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-900/10 text-white">
                          {(data.youth_ideas || []).filter(yi => {
                            const searchLower = youthIdeasSearch.toLowerCase();
                            const matchesSearch = (yi.name || '').toLowerCase().includes(searchLower) || (yi.idea || '').toLowerCase().includes(searchLower) || (yi.location || '').toLowerCase().includes(searchLower) || (yi.contact_number || '').toLowerCase().includes(searchLower);
                            const matchesStatus = youthIdeasStatusFilter === 'all' || yi.status === youthIdeasStatusFilter;
                            const matchesCategory = youthIdeasCategoryFilter === 'all' || yi.category === youthIdeasCategoryFilter;
                            const matchesLang = youthIdeasLangFilter === 'all' || yi.language === youthIdeasLangFilter;
                            return matchesSearch && matchesStatus && matchesCategory && matchesLang;
                          }).map(row => (
                            <tr key={row.id} className="hover:bg-primary-900/5 transition-all">
                              <td className="py-3.5 px-4 font-semibold">{row.name}</td>
                              <td className="py-3.5 px-4 uppercase tracking-wider text-[10px] text-primary-400 font-bold">
                                {row.category}
                              </td>
                              <td className="py-3.5 px-4 text-dark-300 max-w-xs truncate" title={row.idea}>
                                {row.idea}
                              </td>
                              <td className="py-3.5 px-4 text-dark-400">
                                {row.location}{row.ward ? `-${row.ward}` : ''}
                              </td>
                              <td className="py-3.5 px-4 text-dark-400 font-mono">{row.contact_number}</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm ${
                                  row.status === 'implemented' ? 'bg-green-950/40 text-green-400 border border-green-800/40' :
                                  row.status === 'approved' ? 'bg-primary-950/40 text-primary-400 border border-primary-800/40' :
                                  row.status === 'under_review' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40' :
                                  row.status === 'rejected' ? 'bg-red-950/40 text-red-400 border border-red-800/40' :
                                  'bg-dark-900 text-dark-400 border border-dark-700/40'
                                }`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedYouthIdea(row);
                                      setTempStatus(row.status || 'pending');
                                      setTempAdminNote(row.admin_note || '');
                                      setTempProgressPercent(row.progressPercent || 0);
                                      setTempTimelineMessage('');
                                    }}
                                    className="p-2 border border-primary-900/50 hover:bg-primary-900/20 text-primary-400 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                                    title={isNepali ? 'विवरण हेर्नुहोस्' : 'View Details'}
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ id: row.id, type: 'youth_idea' })}
                                    className="p-2 border border-red-955 bg-red-950/20 hover:bg-red-900/40 text-red-500 rounded-sm transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                                    title={isNepali ? 'मेट्नुहोस्' : 'Delete'}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card view (hidden >= 768px) */}
                    <div className="md:hidden space-y-4">
                      {(data.youth_ideas || []).filter(yi => {
                        const searchLower = youthIdeasSearch.toLowerCase();
                        const matchesSearch = (yi.name || '').toLowerCase().includes(searchLower) || (yi.idea || '').toLowerCase().includes(searchLower) || (yi.location || '').toLowerCase().includes(searchLower) || (yi.contact_number || '').toLowerCase().includes(searchLower);
                        const matchesStatus = youthIdeasStatusFilter === 'all' || yi.status === youthIdeasStatusFilter;
                        const matchesCategory = youthIdeasCategoryFilter === 'all' || yi.category === youthIdeasCategoryFilter;
                        const matchesLang = youthIdeasLangFilter === 'all' || yi.language === youthIdeasLangFilter;
                        return matchesSearch && matchesStatus && matchesCategory && matchesLang;
                      }).map(row => (
                        <div key={row.id} className="bg-dark-950 border border-primary-900/10 p-4 rounded-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white text-sm font-bold">{row.name}</h4>
                              <span className="text-[10px] text-primary-400 uppercase tracking-widest font-bold">
                                {row.category}
                              </span>
                            </div>
                            <span className={`inline-block px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-sm ${
                              row.status === 'implemented' ? 'bg-green-950/40 text-green-400 border border-green-800/40' :
                              row.status === 'approved' ? 'bg-primary-950/40 text-primary-400 border border-primary-800/40' :
                              row.status === 'under_review' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40' :
                              row.status === 'rejected' ? 'bg-red-950/40 text-red-400 border border-red-800/40' :
                              'bg-dark-900 text-dark-400 border border-dark-700/40'
                            }`}>
                              {row.status}
                            </span>
                          </div>

                          <p className="text-dark-300 text-xs line-clamp-3 leading-relaxed">
                            {row.idea}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-[10px] text-dark-400 pt-2 border-t border-primary-900/5">
                            <div>
                              <strong className="block text-dark-500 uppercase text-[8px]">{isNepali ? 'ठाउँ' : 'Location'}</strong>
                              <span>{row.location}{row.ward ? `-${row.ward}` : ''}</span>
                            </div>
                            <div>
                              <strong className="block text-dark-500 uppercase text-[8px]">{isNepali ? 'सम्पर्क' : 'Contact'}</strong>
                              <span className="font-mono">{row.contact_number}</span>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-primary-900/10">
                            <button
                              onClick={() => {
                                setSelectedYouthIdea(row);
                                setTempStatus(row.status || 'pending');
                                setTempAdminNote(row.admin_note || '');
                                setTempProgressPercent(row.progressPercent || 0);
                                setTempTimelineMessage('');
                              }}
                              className="px-4 py-2 border border-primary-900/50 hover:bg-primary-900/20 text-primary-400 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 min-h-[44px]"
                            >
                              <Eye size={12} />
                              <span>{isNepali ? 'विवरण' : 'View'}</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ id: row.id, type: 'youth_idea' })}
                              className="px-4 py-2 border border-red-955 bg-red-950/20 hover:bg-red-900/40 text-red-500 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 min-h-[44px]"
                            >
                              <Trash2 size={12} />
                              <span>{isNepali ? 'हटाउनुहोस्' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Unified Deletion Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-dark-900 border border-primary-900/40 rounded-sm p-6 shadow-2xl z-10 text-center">
            <div className="w-12 h-12 bg-red-950/50 border border-red-800/40 rounded-sm flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-2">
              {isNepali ? 'के तपाईं निश्चित हुनुहुन्छ?' : 'Are you sure?'}
            </h3>
            <p className="text-dark-400 text-xs mb-6 leading-relaxed">
              {t('confirmDelete')}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-primary-800/60 hover:border-primary-600 rounded-sm text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-all duration-200"
              >
                {isNepali ? 'रद्द गर्नुहोस्' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteRecord}
                disabled={actionLoadingId !== null}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-sm text-xs font-bold uppercase tracking-widest shadow-red-glow transition-all duration-200 flex items-center gap-1.5"
              >
                {actionLoadingId ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                <span>{t('delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Add/Edit Form Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setVideoModalOpen(false)} />
          
          <div className="relative w-[calc(100vw-24px)] sm:w-full sm:max-w-xl bg-dark-900 border border-primary-900/40 rounded-sm p-5 sm:p-8 shadow-2xl z-10 my-4 max-h-[calc(100dvh-24px)] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 text-dark-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-white text-xl font-bold font-display uppercase tracking-wider mb-6">
              {editingVideo ? t('editVideo') : t('addVideo')}
            </h3>

            <form onSubmit={handleSaveVideo} className="space-y-5">
              {/* English Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                    {t('videoTitleEn')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm"
                    placeholder="E.g. Community Health Camp"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                    {t('videoTitleNe')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleNe}
                    onChange={(e) => setFormTitleNe(e.target.value)}
                    className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm font-nepali"
                    placeholder="उदा. सामुदायिक स्वास्थ्य शिविर"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1.5">
                <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                  {t('videoDescEn')} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formDescEn}
                  onChange={(e) => setFormDescEn(e.target.value)}
                  className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm"
                  placeholder="English details about the initiative..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                  {t('videoDescNe')} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formDescNe}
                  onChange={(e) => setFormDescNe(e.target.value)}
                  className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm font-nepali"
                  placeholder="पहल सम्बन्धी नेपाली विवरण..."
                />
              </div>

              {/* Video URL */}
              <div className="space-y-1.5">
                <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                  {t('videoUrl')} *
                </label>
                <input
                  type="url"
                  required
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm"
                  placeholder="https://www.youtube.com/watch?v=... or Facebook / Vimeo / TikTok link"
                />
              </div>

              {/* Cover Image & Metadata preview */}
              <div className="space-y-3 p-4 bg-dark-950/60 border border-primary-950 rounded-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                      {t('coverImage')}
                    </label>
                    <span className="text-[10px] text-dark-500 block">
                      Platform detected: <strong className="text-primary-400 uppercase">{formPlatform}</strong>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAutoDetectCover}
                      disabled={previewLoading || uploadLoading}
                      className="px-3 py-1.5 border border-primary-900 hover:border-primary-700 bg-primary-900/10 text-primary-400 hover:text-white rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1"
                    >
                      {previewLoading ? <RefreshCw size={10} className="animate-spin" /> : null}
                      <span>{isNepali ? 'कभर तान्नुहोस्' : 'Detect Cover'}</span>
                    </button>
                    <label className="px-3 py-1.5 border border-primary-900 hover:border-primary-700 bg-primary-900/10 text-primary-400 hover:text-white rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1">
                      {uploadLoading ? <RefreshCw size={10} className="animate-spin" /> : null}
                      <span>{isNepali ? 'अपलोड गर्नुहोस्' : 'Upload Cover'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomCoverUpload}
                        disabled={previewLoading || uploadLoading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Status Indicator Messages */}
                <div className="text-xs">
                  {previewLoading && (
                    <p className="text-yellow-500 animate-pulse font-medium">
                      ⏳ {isNepali ? 'थम्बनेल पत्ता लगाउँदै...' : 'Detecting thumbnail...'}
                    </p>
                  )}
                  {uploadLoading && (
                    <p className="text-yellow-500 animate-pulse font-medium">
                      ⏳ {isNepali ? 'कभर अपलोड हुँदै...' : 'Uploading cover...'}
                    </p>
                  )}
                  {!previewLoading && !uploadLoading && (
                    <>
                      {formThumbnailStatus === 'auto' && formCoverUrl && (
                        <div className="space-y-1">
                          <p className="text-green-500 font-semibold">
                            ✓ {isNepali ? 'थम्बनेल पत्ता लाग्यो' : 'Thumbnail detected'}
                          </p>
                          <span className="text-[10px] text-dark-400 block">
                            {isNepali ? 'पत्ता लागेको थम्बनेल प्रयोग हुँदैछ' : 'Using Detected Cover'}
                          </span>
                        </div>
                      )}
                      {formThumbnailStatus === 'custom' && formCoverUrl && (
                        <div className="space-y-1">
                          <p className="text-green-500 font-semibold">
                            ✓ {isNepali ? 'कस्टम कभर सक्रिय छ' : 'Custom cover active'}
                          </p>
                        </div>
                      )}
                      {formThumbnailStatus === 'failed' && (
                        <div className="space-y-1.5 p-2.5 bg-red-950/20 border border-red-950 rounded-sm">
                          <p className="text-red-400 font-semibold text-xs leading-relaxed">
                            ⚠ {formErrorMsg || (isNepali ? 'यो भिडियोको लागि कभर स्वतः पत्ता लगाउन असमर्थ।' : 'Unable to automatically detect a cover for this video.')}
                          </p>
                          <p className="text-[10px] text-dark-400">
                            {isNepali ? 'कृपया कभर इमेज म्यानुअल्ली अपलोड गर्नुहोस्।' : 'Please upload a cover image manually.'}
                          </p>
                        </div>
                      )}
                      {formThumbnailStatus === 'none' && !formCoverUrl && (
                        <p className="text-dark-500 italic">
                          {isNepali ? 'कुनै कभर थपिएको छैन। कभर स्वतः पत्ता लगाउनुहोस् वा अपलोड गर्नुहोस्।' : 'No cover added yet. Please click Detect Cover or upload a custom image.'}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {formCoverUrl && (
                  <div className="relative aspect-video w-full max-w-[240px] mx-auto bg-dark-950 border border-primary-950 rounded-sm overflow-hidden flex items-center justify-center mt-2">
                    <img
                      src={formCoverUrl}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormCoverUrl('');
                        setFormThumbnailStatus('none');
                        setFormCoverSource('auto');
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 flex items-center justify-center text-dark-300 hover:text-white border border-primary-900"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                  {t('status')}
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm"
                >
                  <option value="draft">{t('draft')}</option>
                  <option value="published">{t('published')}</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 border-t border-primary-950/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2 border border-primary-800/60 hover:border-primary-600 rounded-sm text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-all duration-200"
                >
                  {isNepali ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="btn-primary flex items-center gap-1.5 px-5 py-2.5 text-xs uppercase tracking-widest shadow-red-glow font-bold"
                >
                  {saveLoading ? <RefreshCw size={12} className="animate-spin" /> : null}
                  <span>{t('saveVideo')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Youth Idea Edit / Details Modal */}
      {selectedYouthIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedYouthIdea(null)} />
          
          <div className="relative w-[calc(100vw-24px)] sm:w-full sm:max-w-xl bg-dark-900 border border-primary-900/40 rounded-sm p-5 sm:p-8 shadow-2xl z-10 my-4 max-h-[calc(100dvh-24px)] overflow-y-auto font-sans">
            {/* Close button */}
            <button
              onClick={() => setSelectedYouthIdea(null)}
              className="absolute top-4 right-4 text-dark-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-white text-xl font-bold font-display uppercase tracking-wider mb-6">
              {isNepali ? 'युवा विचार विवरण' : 'Youth Idea Details'}
            </h3>

            <div className="space-y-4 text-xs text-dark-300">
              {/* Category & language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="block text-dark-500 uppercase text-[9px] mb-1">{isNepali ? 'श्रेणी' : 'Category'}</strong>
                  <span className="text-primary-400 uppercase tracking-widest font-bold text-[10px] bg-primary-950/20 px-2 py-1 rounded-sm border border-primary-900/20 inline-block">
                    {selectedYouthIdea.category}
                  </span>
                </div>
                <div>
                  <strong className="block text-dark-500 uppercase text-[9px] mb-1">{isNepali ? 'भाषा' : 'Language'}</strong>
                  <span className="text-white uppercase font-bold bg-dark-950 px-2.5 py-1 rounded-sm inline-block">
                    {selectedYouthIdea.language}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <strong className="block text-dark-500 uppercase text-[9px] mb-1">{isNepali ? 'प्रस्तावकको नाम' : "Submitter's Name"}</strong>
                <span className="text-white font-semibold text-sm">{selectedYouthIdea.name}</span>
              </div>

              {/* Location & Contact details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="block text-dark-500 uppercase text-[9px] mb-1">{isNepali ? 'ठेगाना' : 'Location'}</strong>
                  <span className="text-white">{selectedYouthIdea.location}{selectedYouthIdea.ward ? `-${selectedYouthIdea.ward}` : ''}</span>
                </div>
                <div>
                  <strong className="block text-dark-500 uppercase text-[9px] mb-1">{isNepali ? 'सम्पर्क नम्बर' : 'Contact Number'}</strong>
                  <span className="text-white font-mono">{selectedYouthIdea.contact_number}</span>
                </div>
              </div>

              {/* Email if present */}
              {selectedYouthIdea.email && (
                <div>
                  <strong className="block text-dark-500 uppercase text-[9px] mb-1">{isNepali ? 'इमेल' : 'Email'}</strong>
                  <span className="text-white font-mono">{selectedYouthIdea.email}</span>
                </div>
              )}

              {/* Idea Text Content */}
              <div className="bg-dark-950 border border-primary-900/10 p-4 rounded-sm">
                <strong className="block text-dark-500 uppercase text-[9px] mb-2">{isNepali ? 'विचार' : 'Proposed Idea'}</strong>
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedYouthIdea.idea}
                </p>
              </div>

              {/* Status Update Select */}
              <div className="space-y-1.5 pt-2 border-t border-primary-900/10">
                <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                  {isNepali ? 'अवस्था परिवर्तन गर्नुहोस्' : 'Update Status'}
                </label>
                <select
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                  className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm"
                >
                  <option value="pending">{isNepali ? 'विचाराधीन (Pending)' : 'Pending'}</option>
                  <option value="under_review">{isNepali ? 'समीक्षाधीन (Under Review)' : 'Under Review'}</option>
                  <option value="approved">{isNepali ? 'स्वीकृत (Approved)' : 'Approved'}</option>
                  <option value="in_progress">{isNepali ? 'प्रगतिमा (In Progress)' : 'In Progress'}</option>
                  <option value="implemented">{isNepali ? 'कार्यान्वित (Implemented)' : 'Implemented'}</option>
                  <option value="rejected">{isNepali ? 'अस्वीकृत (Rejected)' : 'Rejected'}</option>
                </select>
              </div>

              {/* Implementation Progress Percent */}
              <div className="space-y-1.5">
                <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                  {isNepali ? 'कार्यान्वयन प्रगति (%)' : 'Implementation Progress (%)'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tempProgressPercent}
                    onChange={(e) => setTempProgressPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-24 bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-3 py-2.5 text-white text-sm font-mono"
                  />
                  <div className="flex-1 bg-dark-950 border border-primary-950 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${tempProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-primary-400 font-mono text-xs font-bold">{tempProgressPercent}%</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[0, 10, 25, 50, 75, 90, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTempProgressPercent(pct)}
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border transition-all ${tempProgressPercent === pct ? 'border-primary-600 bg-primary-900/30 text-primary-300' : 'border-primary-900/40 text-dark-500 hover:border-primary-700 hover:text-dark-300'}`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Update Message (appended to timeline) */}
              <div className="space-y-1.5">
                <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                  {isNepali ? 'प्रगति अपडेट सन्देश' : 'Progress Update Message'}
                  <span className="text-dark-600 font-normal ml-1 normal-case">({isNepali ? 'सार्वजनिक टाइमलाइनमा देखिनेछ' : 'will appear on public timeline'})</span>
                </label>
                <textarea
                  rows={2}
                  value={tempTimelineMessage}
                  onChange={(e) => setTempTimelineMessage(e.target.value)}
                  placeholder={isNepali ? 'प्रगति सन्देश लेख्नुहोस्...' : 'e.g. "Road construction has started in Ward 5..."'}
                  className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm resize-none"
                />
              </div>

              {/* Admin note textarea */}
              <div className="space-y-1.5">
                <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                  {isNepali ? 'आन्तरिक नोट (प्रशासकीय मात्र)' : 'Internal Admin Note (Private)'}
                </label>
                <textarea
                  rows={2}
                  value={tempAdminNote}
                  onChange={(e) => setTempAdminNote(e.target.value)}
                  placeholder={isNepali ? 'यहाँ टिप्पणीहरू लेख्नुहोस्...' : 'Private admin observations...'}
                  className="w-full bg-dark-950 border border-primary-950 focus:border-primary-600 focus:outline-none rounded-sm px-4 py-2.5 text-white text-sm resize-none"
                />
              </div>

              {/* Progress timeline history */}
              {(adminTimelineUpdates.length > 0 || adminTimelineLoading) && (
                <div className="space-y-2 pt-2 border-t border-primary-900/10">
                  <label className="text-dark-400 text-xs font-semibold uppercase tracking-wider block">
                    {isNepali ? 'प्रगति इतिहास' : 'Progress History'}
                  </label>
                  {adminTimelineLoading ? (
                    <div className="flex items-center gap-1.5 text-dark-500 text-xs py-2">
                      <RefreshCw size={11} className="animate-spin" />
                      <span>{isNepali ? 'लोड हुँदैछ...' : 'Loading...'}</span>
                    </div>
                  ) : (
                    <div className="relative pl-5 border-l border-primary-900/20 space-y-3 py-1 ml-1 max-h-36 overflow-y-auto">
                      {adminTimelineUpdates.map((item, idx) => {
                        const isLast = idx === adminTimelineUpdates.length - 1;
                        return (
                          <div key={item.id} className="relative">
                            <span className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border ${isLast ? 'bg-primary-600 border-primary-400' : 'bg-dark-800 border-primary-900/50'}`} />
                            <div className="space-y-0.5">
                              <div className="flex justify-between gap-2 text-[10px]">
                                <span className={`font-bold uppercase tracking-wider ${isLast ? 'text-primary-400' : 'text-white'}`}>
                                  {item.status} {item.progressPercent > 0 ? `— ${item.progressPercent}%` : ''}
                                </span>
                                <span className="text-dark-600 font-mono flex-shrink-0">
                                  {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              {item.message && (
                                <p className="text-dark-500 text-[10px] leading-relaxed">{item.message}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Save / Actions Buttons */}
              <div className="flex justify-end gap-3 border-t border-primary-950/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedYouthIdea(null)}
                  className="px-4 py-2 border border-primary-800/60 hover:border-primary-600 rounded-sm text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-all duration-200"
                >
                  {isNepali ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={updatingYouthIdea}
                  onClick={() => handleSaveYouthIdeaUpdate(selectedYouthIdea.id, tempStatus, tempProgressPercent, tempTimelineMessage, tempAdminNote)}
                  className="btn-primary flex items-center gap-1.5 px-5 py-2.5 text-xs uppercase tracking-widest shadow-red-glow font-bold"
                >
                  {updatingYouthIdea ? <RefreshCw size={12} className="animate-spin" /> : null}
                  <span>{isNepali ? 'बचत गर्नुहोस्' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
