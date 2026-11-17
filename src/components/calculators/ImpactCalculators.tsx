import { useState } from "react";
import { IMPACT_DEFAULTS } from "@/data/site";
import { Arrow } from "@/components/ui";
import { openContact } from "@/lib/contact";

const num = (n: number, digits = 0) => new Intl.NumberFormat("en-ZA", { maximumFractionDigits: digits }).format(n);
const rand = (n: number) => `R${new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 }).format(n)}`;

export const IMPACT_DISCLAIMER =
  "Illustrative estimates, not promises. Actual time saved, recovered enquiries and ad results depend on your business, systems and campaigns.";

function Result({ value, label }: { value: string; label: string }) {
  return (
    <p className="flex flex-col gap-1.5 border-t border-line pt-4">
      <strong className="display text-4xl normal-case sm:text-5xl">{value}</strong>
      <span className="text-xs text-muted">{label}</span>
    </p>
  );
}

/* ------------------------------------------------------------------
 * Automations + follow-up (time saved) calculator
 * hours/month = hours/week × 52/12 · value = hours/month × cost/hour
 * recovered = missed enquiries × recovery %
 * ------------------------------------------------------------------ */
export function TimeCalculator({ onDone }: { onDone?: () => void }) {
  const [hours, setHours] = useState(IMPACT_DEFAULTS.adminHoursPerWeek);
  const [cost, setCost] = useState(IMPACT_DEFAULTS.staffCostPerHour);
  const [missed, setMissed] = useState(IMPACT_DEFAULTS.missedEnquiries);
  const [recovery, setRecovery] = useState(IMPACT_DEFAULTS.recoveryRate);

  const monthlyHours = hours * (52 / 12);
  const timeValue = monthlyHours * cost;
  const recovered = (missed * recovery) / 100;

  return (
    <div>
      <span className="micro text-copper">AUTOMATIONS + FOLLOW-UP</span>
      <h3 className="display mt-3 text-3xl normal-case sm:text-4xl">Catch more of the leads you already have.</h3>
      <p className="mt-3 max-w-xl text-sm text-muted">Estimate the time freed up and missed enquiries your follow-up could recover.</p>

      <label htmlFor="admin-hours" className="mt-8 flex items-center justify-between gap-4 text-sm font-semibold">
        Admin time automated each week <strong className="text-base text-peach">{hours} hrs</strong>
      </label>
      <input id="admin-hours" type="range" min="0" max="40" step="1" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-3" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="field">
          Staff cost / hour
          <span className="flex items-center border border-line-strong bg-ink/60">
            <b className="pl-3 text-muted">R</b>
            <input
              aria-label="Estimated staff cost per hour in rand"
              type="number"
              min="0"
              max="1000000"
              step="10"
              value={cost}
              onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
              className="!border-0"
            />
          </span>
        </label>
        <label className="field">
          Missed enquiries / month
          <input
            aria-label="Missed enquiries per month"
            type="number"
            min="0"
            max="100000"
            step="1"
            value={missed}
            onChange={(e) => setMissed(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
      </div>

      <label htmlFor="recovery-rate" className="mt-6 flex items-center justify-between gap-4 text-sm font-semibold">
        Follow-up recovery assumption <strong className="text-base text-peach">{recovery}%</strong>
      </label>
      <input id="recovery-rate" type="range" min="0" max="100" step="5" value={recovery} onChange={(e) => setRecovery(Number(e.target.value))} className="mt-3" />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <Result value={`${num(monthlyHours, 1)} hrs`} label="potential time freed / month" />
        <Result value={rand(timeValue)} label="estimated time value / month" />
        <Result value={num(recovered, 1)} label="potential recovered enquiries / month" />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-dim">{IMPACT_DISCLAIMER}</p>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            onDone?.();
            openContact({ service: "Automation", openForm: true });
          }}
        >
          TALK TO US ABOUT AUTOMATION <Arrow diagonal />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 * Google + Meta ads calculator
 * visits = budget ÷ cost per click · enquiries = visits × enquiry rate
 * ------------------------------------------------------------------ */
export function AdsCalculator({ onDone }: { onDone?: () => void }) {
  const [budget, setBudget] = useState(IMPACT_DEFAULTS.adBudget);
  const [cpc, setCpc] = useState(IMPACT_DEFAULTS.costPerClick);
  const [rate, setRate] = useState(IMPACT_DEFAULTS.enquiryRate);

  const visits = cpc > 0 ? budget / cpc : 0;
  const enquiries = (visits * rate) / 100;

  return (
    <div>
      <span className="micro text-copper">GOOGLE + META ADS</span>
      <h3 className="display mt-3 text-3xl normal-case sm:text-4xl">Bring new people to your business.</h3>
      <p className="mt-3 max-w-xl text-sm text-muted">Set an ad budget to estimate visits and potential enquiries.</p>

      <label className="field mt-8">
        Monthly ad budget
        <span className="flex items-center border border-line-strong bg-ink/60">
          <b className="pl-3 text-muted">R</b>
          <input
            aria-label="Monthly advertising budget in rand"
            type="number"
            min="0"
            max="10000000"
            step="100"
            value={budget}
            onChange={(e) => setBudget(Math.max(0, Number(e.target.value) || 0))}
            className="!border-0"
          />
        </span>
      </label>

      <div className="mt-8 border border-line bg-ink/50 p-6">
        <span className="micro text-muted">POTENTIAL ENQUIRIES / MONTH</span>
        <strong className="display mt-2 block text-7xl normal-case text-peach sm:text-8xl">{num(enquiries, 1)}</strong>
        <p className="mt-2 text-sm text-muted">
          {num(visits)} estimated visits × {num(rate, 1)}% enquiry rate.
        </p>
      </div>

      <details className="mt-5 border-t border-line pt-4">
        <summary className="text-sm font-semibold">Adjust estimate assumptions +</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="field">
            Estimated cost / click
            <span className="flex items-center border border-line-strong bg-ink/60">
              <b className="pl-3 text-muted">R</b>
              <input
                aria-label="Average cost per click in rand"
                type="number"
                min="1"
                max="1000000"
                step="1"
                value={cpc}
                onChange={(e) => setCpc(Math.max(1, Number(e.target.value) || 1))}
                className="!border-0"
              />
            </span>
          </label>
          <label className="field">
            Visit-to-enquiry rate
            <span className="flex items-center border border-line-strong bg-ink/60">
              <input
                aria-label="Visit-to-enquiry rate percent"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                className="!border-0"
              />
              <b className="pr-3 text-muted">%</b>
            </span>
          </label>
        </div>
      </details>

      <p className="mt-5 text-xs text-muted">Example only. Google and Meta results vary by audience, offer and campaign.</p>
      <p className="mt-2 text-xs leading-relaxed text-dim">{IMPACT_DISCLAIMER}</p>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            onDone?.();
            openContact({ service: "Marketing", openForm: true });
          }}
        >
          TALK TO US ABOUT ADS <Arrow diagonal />
        </button>
        <a className="link-u" href="/marketing">
          MARKETING RATES <Arrow diagonal />
        </a>
      </div>
    </div>
  );
}
