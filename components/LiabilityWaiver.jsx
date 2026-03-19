'use client';

import { useState } from 'react';
import { CheckCircle2, ShieldCheck, ChevronRight, ChevronLeft, AlertCircle, Info, User, Phone, Signature, CloudLightning as Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LiabilityWaiver({ onComplete }) {
  const [step, setStep] = useState(1);
  const [ageRange, setAgeRange] = useState(null); // 'adult' or 'minor'
  const [formData, setFormData] = useState({
    fullName: '',
    signature: '',
    date: new Date().toISOString().split('T')[0],
    parentName: '',
    parentSignature: '',
    emergencyContact: '',
    emergencyPhone: '',
    agreed: false
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const WAIVER_TEXT = `
COMPREHENSIVE LIABILITY WAIVER, RELEASE, AND ASSUMPTION OF RISK AGREEMENT
Event: The Circular Economy: From Youth to Industry
Organization: Ethos Sustainability
Governing State: Texas

1. ACKNOWLEDGMENT AND ASSUMPTION OF RISK
I, the undersigned participant (or parent/legal guardian if participant is a minor), acknowledge that participation in this conference and related activities involves inherent risks, including but not limited to:
- Personal injury, illness, or death
- Property damage, theft, or loss
- Risks associated with travel to and from the event
- Interaction with other participants, speakers, and third parties
- Exposure to communicable illnesses
I knowingly and voluntarily assume all such risks, both known and unknown, even if arising from the negligence of Ethos Sustainability or others.

2. RELEASE AND WAIVER OF LIABILITY
To the fullest extent permitted by Texas law, I hereby release, waive, discharge, and covenant not to sue Ethos Sustainability and its officers, directors, volunteers, employees, agents, sponsors, partners, affiliates, venue providers, and representatives (collectively, "Released Parties") from any and all liability, claims, demands, damages, or causes of action arising out of or related to participation in the event.
This includes, without limitation, claims arising from negligence, premises liability, or any other legal theory.

3. INDEMNIFICATION
I agree to indemnify, defend, and hold harmless the Released Parties from any and all claims, liabilities, damages, losses, or expenses (including reasonable attorneys’ fees) arising from:
- My participation in the event
- My violation of any rules or policies
- My actions or omissions
- My minor child’s participation (if applicable)

4. MEDICAL AUTHORIZATION AND RESPONSIBILITY
I acknowledge that:
- Ethos Sustainability does not provide medical insurance
- I am solely responsible for any medical costs incurred
In the event of an emergency, I authorize Ethos Sustainability to seek medical treatment for me (or my minor child) if I am unable to do so.

5. CODE OF CONDUCT
I agree to:
- Follow all event rules, instructions, and safety protocols
- Act respectfully and professionally
- Refrain from disruptive, unsafe, or unlawful behavior
Ethos Sustainability reserves the right to remove any participant without refund for violations.

6. MEDIA RELEASE
I grant Ethos Sustainability the irrevocable right to capture and use my image, likeness, voice, and participation in photographs, video recordings, and other media for educational, promotional, and commercial purposes, without compensation.

7. DATA AND PRIVACY ACKNOWLEDGMENT
I acknowledge that by participating and/or using event-related applications, I may provide personal information. I understand that:
- Ethos Sustainability may collect and use this data for operational, educational, and event-related purposes
- Data will not be sold to third parties
- Reasonable measures will be taken to protect my data

8. MINOR PARTICIPATION AND PARENTAL CONSENT
If the participant is under 18 years of age:
- I certify I am the parent or legal guardian
- I consent to participation
- I assume all risks on behalf of the minor
- I agree to all terms of this agreement on behalf of the minor

9. HEALTH AND COMMUNICABLE DISEASE DISCLAIMER
I acknowledge that participation may expose me to communicable diseases. I voluntarily assume all risks related to such exposure and agree not to hold the Released Parties liable.

10. TRANSPORTATION AND PARKING DISCLAIMER
I acknowledge that Ethos Sustainability is not responsible for:
- Transportation to or from the event
- Parking arrangements or fees
- Any incidents occurring in parking facilities or transit

11. NO GUARANTEE OF OUTCOMES
I understand that the conference may include speakers, networking opportunities, and investor interactions. Ethos Sustainability makes no guarantees regarding:
- Business, educational, or career outcomes
- Funding, partnerships, or opportunities

12. VENUE DISCLAIMER
If the event is held at a third-party venue, I acknowledge that such venue is not responsible for the organization or conduct of the event and is included as a Released Party where applicable.

13. REFUND AND CANCELLATION POLICY
I understand that event registration fees, if any, may be subject to a separate refund and cancellation policy. Removal due to misconduct will not result in a refund.

14. SEVERABILITY
If any provision of this agreement is found unenforceable, the remaining provisions shall remain in full force and effect.

15. GOVERNING LAW AND VENUE
This agreement shall be governed by the laws of the State of Texas. Any disputes shall be resolved in courts located within Texas.

16. ACKNOWLEDGMENT OF UNDERSTANDING
I acknowledge that:
- I have read and fully understand this agreement
- I am giving up substantial legal rights
- I am signing voluntarily without coercion
  `;

  const handleAgeSelect = (range) => {
    setAgeRange(range);
    setStep(2);
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmitInitial = (e) => {
    e.preventDefault();
    if (!formData.agreed) return toast.error('Please agree to the waiver terms');
    
    // Validate based on age
    if (ageRange === 'adult') {
      if (!formData.fullName || !formData.signature) return toast.error('Please fill in your name and signature');
    } else {
      if (!formData.fullName || !formData.parentName || !formData.parentSignature || !formData.emergencyContact || !formData.emergencyPhone) {
        return toast.error('Please fill in all required fields');
      }
    }
    
    setShowConfirmation(true);
  };

  const finalizeSubmission = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/liability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age_range: ageRange,
          signature_data: formData
        }),
      });

      if (res.ok) {
        setStep(4);
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (error) {
      toast.error('Network error during submission');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  // UI Components
  if (step === 1) {
    return (
      <div className="waiver-container" style={styles.container}>
        <div style={styles.header}>
          <ShieldCheck size={48} color="var(--g)" style={{ marginBottom: 16 }} />
          <h1 style={styles.title}>Safety & Liability</h1>
          <p style={styles.subtitle}>Before we begin, we need to ensure you understand our event policies. First, please select your age group:</p>
        </div>

        <div style={styles.cardGrid}>
          <div onClick={() => handleAgeSelect('adult')} style={styles.ageCard}>
            <div style={styles.ageIconBox}><User size={24} /></div>
            <h3 style={styles.ageTitle}>18 or older</h3>
            <p style={styles.ageDesc}>I am an adult participant signing for myself.</p>
            <ChevronRight size={20} color="var(--muted)" style={styles.chevron} />
          </div>

          <div onClick={() => handleAgeSelect('minor')} style={styles.ageCard}>
            <div style={styles.ageIconBox}><Info size={24} /></div>
            <h3 style={styles.ageTitle}>Under 18 (Minor)</h3>
            <p style={styles.ageDesc}>I am a minor, or a guardian signing for a minor.</p>
            <ChevronRight size={20} color="var(--muted)" style={styles.chevron} />
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="waiver-container" style={styles.container}>
        <button onClick={() => setStep(1)} style={styles.backBtn}>
          <ChevronLeft size={18} /> Back to Age Selection
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>Liability Waiver</h1>
          <p style={styles.subtitle}>Please read and sign the agreement below.</p>
        </div>

        <form onSubmit={handleSubmitInitial} style={styles.form}>
          <div style={styles.scrollBox}>
            <pre style={styles.waiverContent}>{WAIVER_TEXT}</pre>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputRow}>
              <div style={styles.field}>
                <label style={styles.label}>Participant Full Name</label>
                <input 
                  type="text" required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Doe"
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Date</label>
                <input 
                  type="date" readOnly
                  value={formData.date}
                  style={styles.input}
                />
              </div>
            </div>

            {ageRange === 'adult' ? (
              <div style={styles.field}>
                <label style={styles.label}>E-Signature (Type your name)</label>
                <input 
                  type="text" required
                  value={formData.signature}
                  onChange={(e) => handleInputChange('signature', e.target.value)}
                  placeholder="Digitally Sign Here"
                  style={{ ...styles.input, fontStyle: 'italic', color: 'var(--g)' }}
                />
              </div>
            ) : (
              <>
                <div style={styles.inputRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Parent/Guardian Name</label>
                    <input 
                      type="text" required
                      value={formData.parentName}
                      onChange={(e) => handleInputChange('parentName', e.target.value)}
                      placeholder="Jane Doe"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Guardian Signature</label>
                    <input 
                      type="text" required
                      value={formData.parentSignature}
                      onChange={(e) => handleInputChange('parentSignature', e.target.value)}
                      placeholder="Guardian E-Signature"
                      style={{ ...styles.input, fontStyle: 'italic', color: 'var(--g)' }}
                    />
                  </div>
                </div>
                <div style={styles.inputRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Emergency Contact Name</label>
                    <input 
                      type="text" required
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="Name"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Emergency Contact Phone</label>
                    <input 
                      type="tel" required
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      placeholder="Phone Number"
                      style={styles.input}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <label style={styles.checkboxContainer}>
            <input 
              type="checkbox" checked={formData.agreed}
              onChange={(e) => handleInputChange('agreed', e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.checkboxText}>
              {ageRange === 'adult' 
                ? "I have read and fully understand this agreement and am giving up substantial legal rights"
                : "I am the parent or legal guardian of the participant. I have read, fully understand, and agree to all terms on behalf of the minor."}
            </span>
          </label>

          <button type="submit" style={styles.submitBtn}>
            Confirm & Submit
          </button>
        </form>

        {showConfirmation && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <AlertCircle size={40} color="#e63946" style={{ marginBottom: 12 }} />
              <h2 style={styles.modalTitle}>Are you 100% sure?</h2>
              <p style={styles.modalText}>
                By confirming, you are agreeing to a legally binding waiver that releases Ethos Sustainability from liability. This cannot be undone.
              </p>
              <div style={styles.modalBtns}>
                <button onClick={() => setShowConfirmation(false)} style={styles.cancelBtn}>Go Back</button>
                <button onClick={finalizeSubmission} disabled={isSubmitting} style={styles.confirmBtn}>
                  {isSubmitting ? 'Submitting...' : "Yes, I'm sure — Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="waiver-container" style={styles.container}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>
            <CheckCircle2 size={48} />
          </div>
          <h1 style={styles.title}>Thank You!</h1>
          <p style={styles.subtitle}>Your liability waiver has been successfully submitted and verified.</p>
          <button onClick={onComplete} style={styles.continueBtn}>
            Continue to App <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '40px 20px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--fb)',
    color: 'var(--text)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
    animation: 'fadeUp 0.6s var(--liquid)',
  },
  title: {
    fontFamily: 'var(--fh)',
    fontSize: 32,
    fontWeight: 800,
    color: 'var(--g)',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'var(--sub)',
    lineHeight: 1.6,
    fontWeight: 500,
  },
  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    animation: 'fadeUp 0.8s var(--liquid)',
  },
  ageCard: {
    background: 'var(--white)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
      borderColor: 'var(--g)',
    }
  },
  ageIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: 'var(--s1)',
    color: 'var(--g)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageTitle: {
    fontSize: 18,
    fontWeight: 800,
    margin: '0 0 4px',
    color: 'var(--text)',
  },
  ageDesc: {
    fontSize: 13,
    color: 'var(--sub)',
    margin: 0,
    fontWeight: 600,
  },
  chevron: {
    marginLeft: 'auto',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--sub)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    animation: 'fadeUp 0.6s var(--liquid)',
  },
  scrollBox: {
    height: 240,
    background: '#f8f9fa',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 16,
    overflowY: 'auto',
    marginBottom: 8,
  },
  waiverContent: {
    fontSize: 11,
    color: '#444',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    margin: 0,
    fontFamily: 'inherit',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--sub)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--white)',
    outline: 'none',
    fontSize: 14,
    width: '100%',
    transition: 'border-color 0.2s',
  },
  checkboxContainer: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: 3,
    width: 18,
    height: 18,
    accentColor: 'var(--g)',
  },
  checkboxText: {
    fontSize: 13,
    color: 'var(--text)',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  submitBtn: {
    padding: '16px',
    borderRadius: 18,
    background: 'var(--g)',
    color: '#fff',
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: 8,
    boxShadow: '0 8px 24px rgba(62, 92, 38, 0.2)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: 'var(--white)',
    borderRadius: 32,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
    animation: 'successPop 0.4s var(--liquid)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 800,
    margin: '0 0 12px',
    color: '#111',
  },
  modalText: {
    fontSize: 14,
    color: 'var(--sub)',
    lineHeight: 1.6,
    fontWeight: 500,
    marginBottom: 24,
  },
  modalBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  confirmBtn: {
    padding: '14px',
    borderRadius: 14,
    background: 'var(--g)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '14px',
    borderRadius: 14,
    background: '#f1f1f1',
    color: '#666',
    border: 'none',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  successBox: {
    textAlign: 'center',
    padding: '60px 0',
    animation: 'successPop 0.6s var(--liquid)',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    background: 'var(--g)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 12px 32px rgba(62, 92, 38, 0.3)',
  },
  continueBtn: {
    marginTop: 32,
    padding: '16px 32px',
    borderRadius: 18,
    background: 'var(--g)',
    color: '#fff',
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '32px auto 0',
  }
};
