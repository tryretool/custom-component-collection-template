import React, { useState, useRef, useEffect } from 'react';
import { type FC } from 'react';
import { Retool } from '@tryretool/custom-component-support';
import type { MockRoleplayEvaluation, DashboardMetadata, SOPStep } from './types';
import styles from './Dashboard.module.css';


const SAMPLE_METADATA: DashboardMetadata = {
  staff_name: 'Sarah Jenkins',
  staff_id: 'EMP-2024-001',
  sop_name: 'Premium Plan Upgrade',
  call_duration: '12:45 min',
  call_date: 'Jan 17, 2026',
  overall_status: 'Completed',
  audio_url: 'https://dcs-spotify.megaphone.fm/WAYW6918246177.mp3?key=c0f202b20175e6b49fa3c7d48ea9d43f&request_event_id=d3f3e2b3-c3cd-4fce-9e7b-2badda8c370b&session_id=b7b62590-fc2a-4faf-be63-8139d7f13491&timetoken=1768052624_F02AA3BD0243CD8475CD6B43118B2615',
  transcript: `Agent: Thank you for calling Apollo Health Insurance. My name is Sarah. How can I assist you today?
Customer: Hi Sarah, I'm calling because I received a letter about a rate increase on my current plan, and I'm not very happy about it.
Agent: I understand your frustration, and I'd be happy to review your policy with you. Can I please have your policy number?
Customer: Sure, it's P-987654321.
Agent: Thank you. Give me just a moment to pull that up... Okay, I see you're currently on the Silver Saver plan.
Customer: Yes, and the premium is going up by nearly 15%. That seems excessive.
Agent: I can see why that would be concerning. The increase is actually due to a nationwide adjustment in medical costs, but I can check if you qualify for any discounts or if switching to our Gold Flex plan might actually be more cost-effective for your specific needs.
Customer: How would a Gold plan be cheaper?
Agent: Great question. While the monthly premium is slightly higher, the Gold Flex plan has a significantly lower deductible and covers 100% of preventative care, which might lower your total annual costs if you visit the doctor regularly.
Customer: Hmm, I do have a few specialists I see.
Agent: In that case, let's look at the numbers. Based on your usage last year...`,

};

const SAMPLE_EVALUATION_DATA: MockRoleplayEvaluation = {
  // Sample audio/transcript also included here for convenience
  audio_url: 'https://dcs-spotify.megaphone.fm/WAYW6918246177.mp3?key=c0f202b20175e6b49fa3c7d48ea9d43f&request_event_id=d3f3e2b3-c3cd-4fce-9e7b-2badda8c370b&session_id=b7b62590-fc2a-4faf-be63-8139d7f13491&timetoken=1768052624_F02AA3BD0243CD8475CD6B43118B2615',
  transcript: `Agent: Hello, thank you for calling Apollo Health. My name is Sarah. How can I help you today?
Customer: Hi Sarah, I'm calling because I received a bill for my recent check-up and it seems much higher than usual. I'm really confused and honestly a bit frustrated.
Agent: I can certainly understand your frustration, and I'd be happy to look into that bill for you. Can I please have your member ID number?
Customer: Sure, it's A12345678.
Agent: Thank you. Let me pull up your account... Okay, I see the claim from your visit on January 12th. It looks like there was a change in your plan's deductible for this year.
Customer: A change? I wasn't notified of any changes. This is unacceptable. I've been a loyal customer for years!
Agent: I apologize for the confusion. We sent out the Annual Notice of Change packets in November. Did you recall receiving a large envelope from us around that time?
Customer: I get so much mail, I might have missed it. But still, doubling my co-pay? That seems extreme.
Agent: I completely validate your feelings. Medical costs have adjusted nationwide, which caused a shift in our plan structures. However, I want to see if we can do something to help.
Customer: Like what? The bill is already here.
Agent: Well, looking at your account, I see you might be eligible for our "Healthy Living" discount program which could offset some of these costs effectively.
Customer: I've never heard of that. What is it?
Agent: It's a program where you get rewards for completing annual wellness activities. Since you've already done your check-up, you've actually completed step one!
Customer: Really? So I can get money back?
Agent: Exactly! I can submit a request right now to apply that credit to your current balance. Would you like me to do that?
Customer: Yes, absolutely. That would be a huge help. Thank you for finding that.
Agent: You're very welcome! I'm glad we could find a solution. Is there anything else about your coverage you'd like me to review while we're on the line?
Customer: No, that was the main thing. I appreciate you taking the time to explain it.
Agent: It's my pleasure. Thank you for being an Apollo Health member. Have a wonderful day!
Customer: You too, bye.`,
  SOP_Adherence: { tag: 'Good', note: 'Followed greeting and verification steps correctly.' },
  Pressure_Objection_Handling: { pressure_objection_level: 'Medium', tag: 'Strong', note: 'Handled price increase objection with empathy and pivoted to value.', evidence: 'The increase is actually due to a nationwide adjustment in medical costs, but I can check if you qualify for any discounts' },
  Soft_Skills: {
    communication_clarity_structure: { tag: 'Excellent', note: 'Clear transitions between topics.' },
    empathy_kindness_respect_tone: { tag: 'Strong', note: 'Acknowledged customer frustration effectively.' },
    confidence: { tag: 'Good', note: 'Sounded knowledgeable about plan details.' },
    active_listening: { tag: 'Strong', note: 'Addressed specific concerns about specialists.' }
  },
  Learning_Behavior_Engagement: { tag: 'Engaged', note: 'Proactively suggested alternative plans based on usage.' },
  Red_Flags: [],
  SOP_Steps: [
    { step_name: 'Greeting', status: 'Covered', execution_tag: 'Strong', note: 'Professional greeting used.', evidence: 'Thank you for calling Apollo Health Insurance.' },
    { step_name: 'Verification', status: 'Covered', execution_tag: 'Good', note: 'Asked for policy number.', evidence: 'Can I please have your policy number?' },
    { step_name: 'Needs Analysis', status: 'Covered', execution_tag: 'Strong', note: 'Identified core issue (price) and usage patterns.', evidence: 'Based on your usage last year...' }
  ],
  Alternates_Solutions_Escalations_Discounts: [
    { short_title: 'Gold Flex Plan', impact_judgement_tag: 'Positive', note_what_was_offered: 'Offered upgrade to lower total cost.', evaluation_about_timing_relevance: 'Appropriate pivot after objection.' }
  ],
  Strengths_Pointers: ['Empathy', 'Product Knowledge', 'Pivoting'],
  Weakness_Pointers: []
};

// Color coding helper functions for table styling
const getLearningBehaviorColor = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s.includes('receptive') || s.includes('engaged') || s.includes('proactive') || s.includes('fully')) {
    return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }; // emerald
  }
  if (s.includes('disinterested') || s.includes('resistant') || s.includes('partially')) {
    return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' }; // amber
  }
  return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }; // slate
};

const getImpactColor = (outcome?: string) => {
  const o = (outcome || '').toLowerCase();
  if (o.includes('negative')) return '#dc2626'; // red
  if (o.includes('positive') || o.includes('neutral')) return '#16a34a'; // green
  return '#64748b'; // slate
};

const getPerformanceLevelColor = (level?: string) => {
  const l = (level || '').toLowerCase();
  if (l.includes('strong') || l.includes('excellent')) return '#16a34a'; // green
  if (l.includes('weak') || l.includes('incorrect') || l.includes("didn't know")) return '#dc2626'; // red
  if (l.includes('good') || l.includes('average')) return '#d97706'; // amber
  return '#64748b'; // slate
};

const getScoreBadgeStyle = (score: string) => {
  const s = score.toLowerCase();
  if (s.includes('strong') || s.includes('excellent') || s.includes('engaged')) {
    return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
  }
  if (s.includes('good') || s.includes('average') || s.includes('partial')) {
    return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
  }
  if (s.includes('weak') || s.includes('poor')) {
    return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
  }
  return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
};

interface CustomAudioPlayerProps {
  src: string;
  onDurationChange?: (duration: number) => void;
}

const CustomAudioPlayer: FC<CustomAudioPlayerProps> = ({ src, onDurationChange }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);

  const toggleSpeed = () => {
    const speeds: (1 | 1.5 | 2)[] = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      const audioDuration = audio.duration;
      setDuration(audioDuration);
      setCurrentTime(audio.currentTime);

      // Call the callback to pass duration to parent
      if (onDurationChange && !isNaN(audioDuration) && audioDuration > 0) {
        onDurationChange(audioDuration);
      }
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    // Events
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    }
  }, [onDurationChange]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getBackgroundSize = () => {
    return { backgroundSize: `${(currentTime * 100) / (duration || 1)}% 100%` };
  };

  return (
    <div className={styles.customAudioPlayer}>
      <div className={styles.audioVisualizer}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`${styles.waveBar} ${isPlaying ? styles.waveBarActive : ''}`}
            style={{ animationDelay: `${Math.random() * 1.2}s` }}
          />
        ))}
      </div>

      <audio ref={audioRef} src={src} />

      {/* Progress Bar Row */}
      <div className={styles.timeSliderContainer}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className={styles.progressBar}
          style={getBackgroundSize()}
        />
        <div className={styles.timeDisplay}>
          <span>{formatTime(currentTime)}</span>
          <div className={styles.durationSpeedGroup}>
            <span>{formatTime(duration)}</span>
            <button className={styles.playbackSpeedButton} onClick={toggleSpeed}>
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>

      {/* Controls Row - Play Center */}
      <div className={styles.controlsBottomRow}>
        <button className={styles.playPauseButton} onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ marginLeft: '3px' }}>
              <path d="M5 3.868v16.264a1 1 0 001.574.832l12.198-8.132a1 1 0 000-1.664L6.574 3.036A1 1 0 005 3.868z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export const MockRoleplayDashboard: FC = () => {
  // State for SOP step expansion
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [expandedRedFlags, setExpandedRedFlags] = useState<Set<number>>(new Set());

  // State for audio duration
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  // Get evaluation data from Retool model
  const [evaluationData] = Retool.useStateObject({
    name: 'evaluationData'
  }) as unknown as [MockRoleplayEvaluation | undefined, (val: MockRoleplayEvaluation) => void];

  // Get metadata (optional)
  const [metadata] = Retool.useStateObject({
    name: 'metadata'
  }) as unknown as [DashboardMetadata | undefined, (val: DashboardMetadata) => void];

  // Mode: 'list' or 'detail'
  const [currentMode, setCurrentMode] = useState<'list' | 'detail'>('list');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
  const [evaluationsList, setEvaluationsList] = useState<any[]>([]);
  const [fetchedEvaluationData, setFetchedEvaluationData] = useState<MockRoleplayEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch list on mount
  useEffect(() => {
    setIsListLoading(true);
    fetch('https://mockroleplay-backend.onrender.com/api/evaluations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvaluationsList(data);
        }
        setIsListLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch list:', err);
        setIsListLoading(false);
      });
  }, []);

  // Fetch detail when ID selected
  useEffect(() => {
    if (selectedEvaluationId) {
      setIsLoading(true);
      setAudioDuration(null); // Reset duration when loading new evaluation
      fetch(`https://mockroleplay-backend.onrender.com/api/evaluations/${selectedEvaluationId}`)
        .then(res => res.json())
        .then(data => {
          setFetchedEvaluationData(data);
          setIsLoading(false);
          setCurrentMode('detail');
        })
        .catch(err => {
          console.error('Failed to fetch detail:', err);
          setIsLoading(false);
        });
    }
  }, [selectedEvaluationId]);

  // Handle Back to List
  const handleBackToList = () => {
    setCurrentMode('list');
    setSelectedEvaluationId(null);
    setFetchedEvaluationData(null);
    setAudioDuration(null); // Reset duration when going back
  };

  // Determine final data
  // If in detail mode and we have fetched data, use it.
  // Otherwise fall back to evaluationData prop passed from Retool.
  const finalEvaluationData = (currentMode === 'detail' && fetchedEvaluationData)
    ? fetchedEvaluationData
    : (evaluationData || null);

  // Metadata Logic:
  // Helper function to format duration in seconds to mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Use audio duration if available, otherwise fall back to backend data or default
  const displayDuration = audioDuration
    ? formatDuration(audioDuration)
    : ((currentMode === 'detail' && fetchedEvaluationData) ? (fetchedEvaluationData as any).call_duration : (metadata?.call_duration || '00:00'));

  const finalMetadata: DashboardMetadata = {
    staff_name: 'John Doe',
    staff_id: 'EMP1234',
    sop_name: (currentMode === 'detail' && fetchedEvaluationData) ? (fetchedEvaluationData as unknown as DashboardMetadata).sop_name : (metadata?.sop_name || 'Hospital Price Comparison'),
    call_date: (currentMode === 'detail' && fetchedEvaluationData) ? (fetchedEvaluationData as any).call_date : (metadata?.call_date || 'N/A'),
    call_duration: displayDuration,
    overall_status: (currentMode === 'detail' && fetchedEvaluationData) ? (fetchedEvaluationData as unknown as DashboardMetadata).overall_status : (metadata?.overall_status || 'Completed'),
    audio_url: (currentMode === 'detail' && fetchedEvaluationData && fetchedEvaluationData.audio_url) ? fetchedEvaluationData.audio_url : (metadata?.audio_url || 'https://dcs-spotify.megaphone.fm/WAYW6918246177.mp3?key=c0f202b20175e6b49fa3c7d48ea9d43f'),
    transcript: (currentMode === 'detail' && fetchedEvaluationData && fetchedEvaluationData.transcript) ? fetchedEvaluationData.transcript : (metadata?.transcript || '')
  };

  // Render List View
  if (currentMode === 'list') {
    // Filter evaluations based on search query
    const filteredEvaluations = evaluationsList.filter((evaluation) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        evaluation.id.toLowerCase().includes(searchLower) ||
        evaluation.display_date.toLowerCase().includes(searchLower) ||
        (evaluation.sop_tag || '').toLowerCase().includes(searchLower) ||
        (evaluation.pressure_tag || '').toLowerCase().includes(searchLower)
      );
    });

    return (
      <div className={styles.dashboard} style={{ width: '100%', padding: '32px', boxSizing: 'border-box', background: '#f8fafc' }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          background: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: '#0f172a', letterSpacing: '-0.025em' }}>Mock Roleplay Evaluation</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Review and analyze staff performance in Mock Roleplay Calls</p>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <svg
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 16px 10px 38px',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                width: '200px',
                outline: 'none',
                transition: 'all 0.2s',
                background: '#f8fafc',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>
        </div>

        {/* Table Container */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          {/* Stats Bar */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: 'rgba(248, 250, 252, 0.5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Showing {filteredEvaluations.length} of {evaluationsList.length} records
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px 14px 24px', fontSize: '11px', fontWeight: '700', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    RECORD ID
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    DATE EVALUATED
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    OVERALL SCORE
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    LEARNING BEHAVIOR
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    CUSTOMER IMPACT
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    PERFORMANCE LEVEL
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    COACHING
                  </th>
                </tr>
              </thead>
              <tbody>
                {isListLoading ? (
                  // Skeleton Loading Rows
                  [...Array(7)].map((_, i) => (
                    <tr key={`skeleton-${i}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className={styles.skeletonCell}>
                        <div className={styles.skeletonBar} style={{ width: '70%' }}></div>
                      </td>
                      <td className={styles.skeletonCell}>
                        <div className={styles.skeletonBar} style={{ width: '60%' }}></div>
                      </td>
                      <td className={styles.skeletonCell}>
                        <div className={styles.skeletonBar} style={{ width: '50%' }}></div>
                      </td>
                      <td className={styles.skeletonCell}>
                        <div className={styles.skeletonBar} style={{ width: '65%' }}></div>
                      </td>
                      <td className={styles.skeletonCell}>
                        <div className={styles.skeletonBar} style={{ width: '55%' }}></div>
                      </td>
                      <td className={styles.skeletonCell}>
                        <div className={styles.skeletonBar} style={{ width: '70%' }}></div>
                      </td>
                      <td className={styles.skeletonCell}>
                        <div className={styles.skeletonBar} style={{ width: '40%' }}></div>
                      </td>
                    </tr>
                  ))
                ) : filteredEvaluations.length > 0 ? (
                  filteredEvaluations.map((evaluation, rowIndex) => {
                    // Get color coding for badges
                    const learningBehaviorStyle = getLearningBehaviorColor(
                      evaluation.sop_tag === 'Strong' || evaluation.sop_tag === 'Excellent' ? 'Fully Engaged' :
                        evaluation.sop_tag === 'Good' ? 'Partially Engaged' : 'Disinterested'
                    );
                    const scoreBadgeStyle = getScoreBadgeStyle(evaluation.sop_tag || '');

                    return (
                      <tr
                        key={evaluation.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative',
                          borderLeft: '4px solid transparent'
                        }}
                        onClick={() => setSelectedEvaluationId(evaluation.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to right, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))';
                          e.currentTarget.style.borderLeftColor = '#6366f1';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(99, 102, 241, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderLeftColor = 'transparent';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Record ID */}
                        <td style={{
                          padding: '14px 20px 14px 24px',
                          fontSize: '13px',
                          color: '#0f172a',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontWeight: '500'
                        }}>
                          {evaluation.id.slice(0, 16)}...
                        </td>

                        {/* Date Evaluated */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: '13px', color: '#475569' }}>
                              {evaluation.created_at
                                ? new Date(evaluation.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                                : evaluation.display_date}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {evaluation.created_at
                                ? new Date(evaluation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                          </div>
                        </td>

                        {/* Overall Score (SOP Tag) */}
                        <td style={{ padding: '14px 20px' }}>
                          {evaluation.sop_tag && evaluation.sop_tag !== 'N/A' ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '5px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              borderRadius: '8px',
                              backgroundColor: scoreBadgeStyle.bg,
                              color: scoreBadgeStyle.color,
                              border: `1px solid ${scoreBadgeStyle.border}`,
                              transition: 'all 0.2s',
                              cursor: 'pointer'
                            }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {evaluation.sop_tag}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>N/A</span>
                          )}
                        </td>

                        {/* Learning Behavior */}
                        <td style={{ padding: '14px 20px' }}>
                          {evaluation.sop_tag && evaluation.sop_tag !== 'N/A' ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '5px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              borderRadius: '8px',
                              backgroundColor: learningBehaviorStyle.bg,
                              color: learningBehaviorStyle.color,
                              border: `1px solid ${learningBehaviorStyle.border}`,
                              transition: 'all 0.2s'
                            }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {evaluation.sop_tag === 'Strong' || evaluation.sop_tag === 'Excellent' ? 'Fully Engaged' :
                                evaluation.sop_tag === 'Good' ? 'Partially Engaged' :
                                  'Disinterested'}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>N/A</span>
                          )}
                        </td>

                        {/* Customer Impact */}
                        <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                          {evaluation.pressure_tag && evaluation.pressure_tag !== 'N/A' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontWeight: '600',
                                fontSize: '12px',
                                color: getImpactColor(evaluation.pressure_tag === 'Strong' ? 'Negative' : 'Neutral')
                              }}>
                                {evaluation.pressure_tag === 'Strong' ? 'Negative' : 'Neutral'}
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '14px' }}>→</span>
                              <span style={{
                                fontWeight: '600',
                                fontSize: '12px',
                                color: getImpactColor('Neutral')
                              }}>
                                Neutral
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>N/A</span>
                          )}
                        </td>

                        {/* Performance Level */}
                        <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                          {evaluation.pressure_tag && evaluation.pressure_tag !== 'N/A' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontWeight: '500',
                                fontSize: '12px',
                                color: getPerformanceLevelColor("Didn't Know")
                              }}>
                                Didn't Know
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '14px' }}>→</span>
                              <span style={{
                                fontWeight: '500',
                                fontSize: '12px',
                                color: getPerformanceLevelColor(evaluation.pressure_tag === 'Strong' ? 'Weak' : "Didn't Know")
                              }}>
                                {evaluation.pressure_tag === 'Strong' ? 'Weak' : "Didn't Know"}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>N/A</span>
                          )}
                        </td>

                        {/* Coaching */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>N/A</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
                          No records found matching "{searchQuery}"
                        </p>
                        <button
                          onClick={() => setSearchQuery('')}
                          style={{
                            padding: '6px 16px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#6366f1',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className={styles.dashboard} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: '#64748b' }}>Loading evaluation details...</div>
      </div>
    );
  }

  // If no data (and not loading), show empty state
  if (!finalEvaluationData) {
    return <div className={styles.dashboard} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No evaluation data available.</div>;
  }

  if (finalEvaluationData) {

    // Helper to get severity class
    const getSeverityClass = (severity: string) => {
      switch (severity) {
        case 'High': return styles.chipHigh;
        case 'Medium': return styles.chipMedium;
        case 'Low': return styles.chipLow;
        default: return styles.chipNeutral;
      }
    };

    // Helper to get status class
    const getStatusClass = (status: string) => {
      switch (status) {
        case 'Covered': return styles.statusCovered;
        case 'Partially Covered': return styles.statusPartial;
        case 'Missed': return styles.statusMissed;
        case 'Incorrect': return styles.statusIncorrect;
        default: return '';
      }
    };

    // Helper to get execution tag class
    const getExecutionClass = (tag: string) => {
      const tagLower = tag.toLowerCase().replace(/\s+/g, '');
      switch (tagLower) {
        case 'veryweak': return styles.executionVeryWeak;
        case 'weak': return styles.executionWeak;
        case 'average': return styles.executionAverage;
        case 'good': return styles.executionGood;
        case 'strong': return styles.executionStrong;
        case 'verystrong': return styles.executionVeryStrong;
        default: return styles.executionAverage;
      }
    };

    // Helper to get impact class
    const getImpactClass = (impact: string) => {
      switch (impact) {
        case 'Positive': return styles.chipPositive;
        case 'Neutral': return styles.chipNeutral;
        case 'Negative': return styles.chipNegative;
        default: return styles.chipNeutral;
      }
    };

    // Helper to get adherence chip class
    const getAdherenceClass = (tag: string) => {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes('strong') || tagLower.includes('excellent')) {
        return styles.chipGood;
      } else if (tagLower.includes('average') || tagLower.includes('moderate')) {
        return styles.chipAverage;
      } else {
        return styles.chipNeutral;
      }
    };

    // Count red flags by severity
    const redFlagsCount = finalEvaluationData.Red_Flags?.length || 0;

    // Sort red flags by severity
    const sortedRedFlags = [...(finalEvaluationData.Red_Flags || [])].sort((a, b) => {
      const severityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Helper to toggle Red Flag expansion
    const toggleRedFlag = (index: number) => {
      const newExpanded = new Set(expandedRedFlags);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      setExpandedRedFlags(newExpanded);
    };

    // Helper to toggle SOP step expansion
    const toggleStep = (index: number) => {
      const newExpanded = new Set(expandedSteps);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      setExpandedSteps(newExpanded);
    };

    // Resolve Audio & Transcript (Metadata > Evaluation Data > nothing)
    const resolvedAudioUrl = finalMetadata?.audio_url || finalEvaluationData.audio_url;
    const resolvedTranscript = finalEvaluationData.transcript || finalMetadata?.transcript;

    return (
      <div className={styles.dashboard}>
        {/* STICKY HEADER - Compact with back button */}
        {/* STICKY HEADER - Refined Design */}
        <div className={styles.compactHeader}>
          <div className={styles.headerLeftSection}>
            <button className={styles.backButton} onClick={handleBackToList} aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
              </svg>
            </button>

            <div className={styles.avatarCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            <div className={styles.userInfo}>
              <div className={styles.userNameRow}>
                <span className={styles.staffName}>{finalMetadata?.staff_name || 'Unknown Staff'}</span>
              </div>
              <div className={styles.userMetaRow}>
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className={styles.staffIdText}>{finalMetadata?.staff_id || 'N/A'}</span>
                </>
              </div>
            </div>
          </div>

          <div className={styles.headerRightSection}>
            <div className={styles.metadataBar}>
              <div className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>{finalMetadata?.sop_name || 'Hospital Price Comparison'}</span>
              </div>
              <div className={styles.metaDivider}></div>
              <div className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{finalMetadata?.call_date || 'N/A'}</span>
              </div>
              <div className={styles.metaDivider}></div>
              <div className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{finalMetadata?.call_duration || '00:00'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.header}>
          {/* Header Top Row Removed (Duplicate) */}

          {/* MAIN TITLE & STATUS BADGES */}
          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>Staff Evaluation Report</h1>
            <div className={styles.statusBadges}>
              <span className={`${styles.chip} ${styles.chipCompleted}`}>
                Status: {finalMetadata?.overall_status || 'Completed'}
              </span>
              <span className={`${styles.chip} ${getAdherenceClass(finalEvaluationData.SOP_Adherence?.tag || '')}`}>
                SOP Adherence: {finalEvaluationData.SOP_Adherence?.tag || 'N/A'}
              </span>
              <span className={`${styles.chip} ${styles.chipHigh}`}>
                Pressure: {finalEvaluationData.Pressure_Objection_Handling?.pressure_objection_level || 'N/A'}
              </span>
              {redFlagsCount > 0 && (
                <span className={`${styles.chip} ${styles.chipRedFlags}`}>
                  {redFlagsCount} Red Flags ({sortedRedFlags.filter(f => f.severity === 'High').length} High)
                </span>
              )}
            </div>
          </div>

          {/* Learning Behavior (if present) */}
          {
            finalEvaluationData?.Learning_Behavior_Engagement && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <svg className={styles.sectionIcon} width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                  </svg>
                  Learning Behavior & Engagement
                </h2>
                <div className={styles.summaryCard}>
                  <span className={`${styles.chip} ${styles.chipGood}`}>
                    {finalEvaluationData.Learning_Behavior_Engagement.tag}
                  </span>
                  <div className={styles.summaryCardContent}>
                    {finalEvaluationData.Learning_Behavior_Engagement.note}
                  </div>
                </div>
              </div>
            )
          }

          {/* SECTION 2: AUDIO + TRANSCRIPT PANEL */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg className={styles.sectionIcon} width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
              </svg>
              Audio & Transcript
            </h2>
            <div className={styles.audioTranscriptPanel}>
              <div className={styles.audioPlayerSection}>
                {resolvedAudioUrl ? (
                  <CustomAudioPlayer
                    src={resolvedAudioUrl}
                    onDurationChange={(duration) => setAudioDuration(duration)}
                  />
                ) : (
                  <div className={styles.audioPlayer}>
                    <div style={{ color: '#6c757d', padding: '12px' }}>
                      No audio recording available for this session.
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.transcriptContainer}>
                {resolvedTranscript ? (
                  resolvedTranscript.split('\n').map((line, idx) => {
                    let trimmedLine = line.trim();
                    if (!trimmedLine) return null;

                    // Remove timestamps in format [HH:MM:SS AM/PM] or [HH:MM:SS]
                    trimmedLine = trimmedLine.replace(/^\[\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM)?\]\s*/i, '');

                    // Check for speaker labels (support various formats: AGENT:, Agent:, USER:, CUSTOMER:)
                    const agentMatch = trimmedLine.match(/^(AGENT|Agent):\s*/i);
                    const customerMatch = trimmedLine.match(/^(USER|CUSTOMER|Customer):\s*/i);

                    if (agentMatch || customerMatch) {
                      const isAgent = !!agentMatch;
                      const speaker = isAgent ? 'AGENT' : 'CUSTOMER';
                      const text = trimmedLine.replace(/^(AGENT|Agent|USER|CUSTOMER|Customer):\s*/i, '').trim();

                      if (!text) return null;

                      return (
                        <div key={idx} className={styles.chatMessage}>
                          <span className={`${styles.messageLabel} ${isAgent ? styles.agentLabel : styles.customerLabel}`}>
                            {speaker}
                          </span>
                          <div className={styles.messageText}>
                            {text}
                          </div>
                        </div>
                      );
                    }

                    // If no label but has content, just display the line as-is
                    if (trimmedLine) {
                      return (
                        <div key={idx} className={styles.chatMessage}>
                          <div className={styles.messageText}>
                            {trimmedLine}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })
                ) : (
                  <div style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>
                    Transcript not available. Evidence quotes are displayed in context below.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: EXECUTIVE SUMMARY CARDS */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg className={styles.sectionIcon} width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z" />
              </svg>
              Executive Summary
            </h2>
            <div className={styles.summaryGrid}>
              {/* LEFT COLUMN: SOP Adherence + Pressure Handling */}
              <div className={styles.summaryColumn}>
                {/* SOP Adherence Card */}
                <div className={styles.summaryCard}>
                  <h3 className={styles.summaryCardTitle}>SOP Adherence</h3>
                  <span className={`${styles.chip} ${getAdherenceClass(finalEvaluationData.SOP_Adherence?.tag || '')}`}>
                    {finalEvaluationData.SOP_Adherence?.tag || 'N/A'}
                  </span>
                  <div className={styles.summaryCardContent}>
                    {finalEvaluationData.SOP_Adherence?.note || 'No notes available'}
                  </div>
                </div>

                {/* Pressure & Objection Handling Card */}
                <div className={styles.summaryCard}>
                  <h3 className={styles.summaryCardTitle}>Pressure & Objection Handling</h3>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Level:</span>
                    <span className={`${styles.chip} ${styles.chipHigh}`}>
                      {finalEvaluationData.Pressure_Objection_Handling?.pressure_objection_level || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Performance:</span>
                    <span className={`${styles.chip} ${styles.chipGood}`}>
                      {finalEvaluationData.Pressure_Objection_Handling?.tag || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.summaryCardContent}>
                    {finalEvaluationData.Pressure_Objection_Handling?.note || 'No notes available'}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Soft Skills */}
              <div className={styles.summaryColumn}>
                <div className={styles.softSkillsCard}>
                  <h3 className={styles.summaryCardTitle}>Soft Skills</h3>
                  <div className={styles.skillRow}>
                    <div className={styles.skillLabelGroup}>
                      <span className={styles.skillLabel}>Clarity & Structure:</span>
                      <span className={`${styles.chip} ${styles.chipNeutral}`} style={{ fontSize: '11px', padding: '4px 10px', marginTop: '4px' }}>
                        {finalEvaluationData.Soft_Skills?.communication_clarity_structure?.tag || 'N/A'}
                      </span>
                    </div>
                  </div>
                  {finalEvaluationData.Soft_Skills?.communication_clarity_structure?.note && (
                    <div className={styles.skillNote}>{finalEvaluationData.Soft_Skills.communication_clarity_structure.note}</div>
                  )}

                  <div className={styles.skillRow}>
                    <div className={styles.skillLabelGroup}>
                      <span className={styles.skillLabel}>Empathy & Tone:</span>
                      <span className={`${styles.chip} ${styles.chipNeutral}`} style={{ fontSize: '11px', padding: '4px 10px', marginTop: '4px' }}>
                        {finalEvaluationData.Soft_Skills?.empathy_kindness_respect_tone?.tag || 'N/A'}
                      </span>
                    </div>
                  </div>
                  {finalEvaluationData.Soft_Skills?.empathy_kindness_respect_tone?.note && (
                    <div className={styles.skillNote}>{finalEvaluationData.Soft_Skills.empathy_kindness_respect_tone.note}</div>
                  )}

                  <div className={styles.skillRow}>
                    <div className={styles.skillLabelGroup}>
                      <span className={styles.skillLabel}>Confidence:</span>
                      <span className={`${styles.chip} ${styles.chipGood}`} style={{ fontSize: '11px', padding: '4px 10px', marginTop: '4px' }}>
                        {finalEvaluationData.Soft_Skills?.confidence?.tag || 'N/A'}
                      </span>
                    </div>
                  </div>
                  {finalEvaluationData.Soft_Skills?.confidence?.note && (
                    <div className={styles.skillNote}>{finalEvaluationData.Soft_Skills.confidence.note}</div>
                  )}

                  <div className={styles.skillRow}>
                    <div className={styles.skillLabelGroup}>
                      <span className={styles.skillLabel}>Active Listening:</span>
                      <span className={`${styles.chip} ${styles.chipGood}`} style={{ fontSize: '11px', padding: '4px 10px', marginTop: '4px' }}>
                        {finalEvaluationData.Soft_Skills?.active_listening?.tag || 'N/A'}
                      </span>
                    </div>
                  </div>
                  {finalEvaluationData.Soft_Skills?.active_listening?.note && (
                    <div className={styles.skillNote}>{finalEvaluationData.Soft_Skills.active_listening.note}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: RED FLAGS */}
          {
            sortedRedFlags.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <svg className={styles.sectionIcon} width="18" height="18" viewBox="0 0 16 16" fill="#dc3545">
                    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
                    <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
                  </svg>
                  Red Flags & Business Risk
                </h2>
                <div className={styles.redFlagsList}>
                  {sortedRedFlags.map((flag, idx) => {
                    const cardClass =
                      flag.severity === 'High' ? styles.redFlagCardHigh :
                        flag.severity === 'Medium' ? styles.redFlagCardMedium :
                          styles.redFlagCardLow;

                    const isExpanded = expandedRedFlags.has(idx);

                    return (
                      <div key={idx} className={`${styles.redFlagCard} ${cardClass}`}>
                        <div className={styles.redFlagHeader} onClick={() => toggleRedFlag(idx)}>
                          <div className={styles.redFlagMain}>
                            <span className={`${styles.chip} ${getSeverityClass(flag.severity)}`}>
                              {flag.severity}
                            </span>
                            <h3 className={styles.redFlagTitle}>{flag.title}</h3>
                          </div>
                          <button className={styles.redFlagExpandButton}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.2s'
                            }}>
                              <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                            </svg>
                          </button>
                        </div>
                        {isExpanded && (
                          <div className={styles.redFlagDetails}>
                            {flag.evidence && (
                              <>
                                <div className={styles.redFlagSubLabel}>Evidence:</div>
                                <div className={styles.redFlagEvidence}>
                                  "{flag.evidence}"
                                </div>
                              </>
                            )}
                            <div className={styles.redFlagSubLabel} style={{ marginTop: '12px' }}>Note:</div>
                            <p className={styles.redFlagNote}>{flag.note}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          }

          {/* SECTION 5: SOP STEP-BY-STEP EXECUTION */}
          {
            finalEvaluationData.SOP_Steps && finalEvaluationData.SOP_Steps.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <svg className={styles.sectionIcon} width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z" />
                    <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
                  </svg>
                  SOP Step-by-Step Execution
                </h2>
                <div className={styles.sopStepsList}>
                  {finalEvaluationData.SOP_Steps.map((step, idx) => {
                    const isExpanded = expandedSteps.has(idx);
                    return (
                      <div key={idx} className={styles.sopStepCard}>
                        <div className={styles.sopStepHeader} onClick={() => toggleStep(idx)}>
                          <div className={styles.sopStepMain}>
                            <h3 className={styles.sopStepTitle}>{step.step_name}</h3>
                            <div className={styles.sopStepBadges}>
                              <span className={getStatusClass(step.status)}>{step.status}</span>
                              <span className={getExecutionClass(step.execution_tag)}>
                                {step.execution_tag}
                              </span>
                            </div>
                          </div>
                          <button className={styles.sopExpandButton}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.2s'
                            }}>
                              <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                            </svg>
                          </button>
                        </div>
                        {isExpanded && (
                          <div className={styles.sopStepDetails}>
                            <div className={styles.sopStepDetailItem}>
                              <strong className={styles.sopDetailLabel}>Note:</strong>
                              <p className={styles.sopDetailText}>{step.note}</p>
                            </div>
                            {step.evidence && (
                              <div className={styles.sopStepDetailItem}>
                                <strong className={styles.sopDetailLabel}>Evidence:</strong>
                                <div className={styles.sopEvidence}>"{step.evidence}"</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          }

          {/* SECTION 6: SOLUTIONS & ALTERNATIVES */}
          {
            finalEvaluationData.Alternates_Solutions_Escalations_Discounts &&
            finalEvaluationData.Alternates_Solutions_Escalations_Discounts.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <svg className={styles.sectionIcon} width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3zM6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
                  </svg>
                  Solutions, Alternatives & Escalations
                </h2>
                <div className={styles.solutionsList}>
                  {finalEvaluationData.Alternates_Solutions_Escalations_Discounts.map((solution, idx) => (
                    <div key={idx} className={styles.solutionCard}>
                      <div className={styles.solutionHeader}>
                        <h3 className={styles.solutionTitle}>{solution.short_title}</h3>
                        <span className={`${styles.chip} ${getImpactClass(solution.impact_judgement_tag)}`}>
                          {solution.impact_judgement_tag}
                        </span>
                      </div>
                      <div className={styles.solutionNote}>
                        <strong>What was offered:</strong> {solution.note_what_was_offered}
                      </div>
                      <div className={styles.solutionEvaluation}>
                        <strong>Timing & Relevance:</strong> {solution.evaluation_about_timing_relevance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          {/* SECTION 7: STRENGTHS & WEAKNESSES */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg className={styles.sectionIcon} width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path fill-rule="evenodd" d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3h9.05zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8h2.05zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1h9.05z" />
              </svg>
              Strengths & Weaknesses Summary
            </h2>
            <div className={styles.strengthsWeaknesses}>
              <div className={styles.strengthsColumn}>
                <h3 className={styles.strengthsTitle}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '6px' }}>
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                  </svg>
                  Strengths
                </h3>
                <ul className={styles.strengthsList}>
                  {finalEvaluationData.Strengths_Pointers && finalEvaluationData.Strengths_Pointers.length > 0 ? (
                    finalEvaluationData.Strengths_Pointers.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))
                  ) : (
                    <li>No strengths recorded</li>
                  )}
                </ul>
              </div>
              <div className={styles.weaknessesColumn}>
                <h3 className={styles.weaknessesTitle}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '6px' }}>
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                  </svg>
                  Areas for Improvement
                </h3>
                <ul className={styles.weaknessesList}>
                  {finalEvaluationData.Weakness_Pointers && finalEvaluationData.Weakness_Pointers.length > 0 ? (
                    finalEvaluationData.Weakness_Pointers.map((weakness, idx) => (
                      <li key={idx}>{weakness}</li>
                    ))
                  ) : (
                    <li>No weaknesses recorded</li>
                  )}
                </ul>
              </div>
            </div>
          </div>


        </div>
      </div>
    );
  }
};
