import React, { useState } from "react";
import RequirementForm from "../components/RequirementForm.jsx";
import ExecutiveSummary from "../components/ExecutiveSummary.jsx";
import ForecastChart from "../components/ForecastChart.jsx";
import MarketEntryTiming from "../components/MarketEntryTiming.jsx";
import VesselComparison from "../components/VesselComparison.jsx";
import PortFeasibility from "../components/PortFeasibility.jsx";
import CostBreakdown from "../components/CostBreakdown.jsx";
import ContractStrategy from "../components/ContractStrategy.jsx";
import RiskDashboard from "../components/RiskDashboard.jsx";
import Explainability from "../components/Explainability.jsx";
import ScenarioSimulator from "../components/ScenarioSimulator.jsx";
import { createRequest, fetchReport, runScenario } from "../api/api.js";

export default function Dashboard() {
  const [report, setReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    setError(null);
    setReport(null);
    setActiveScenario(null);
    try {
      const request = await createRequest(formValues);
      const generated = await fetchReport(request._id);
      if (generated.error) {
        setError(generated.error);
      } else {
        setReport(generated);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Something went wrong generating the report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScenario = async (scenario) => {
    if (!report) return;
    setScenarioLoading(true);
    setActiveScenario(scenario.type);
    try {
      const adjusted = await runScenario({ reportId: report._id, type: scenario.type, value: scenario.value });
      setReport(adjusted);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setScenarioLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="main-header">
        <div className="eyebrow">Chartering Decision Report</div>
        <h1>Freight Forecasting &amp; Vessel Chartering</h1>
        <p className="lede">
          Enter a cargo requirement below. The system forecasts freight rates, checks vessel–port
          feasibility across India's East Coast, and returns a full chartering decision report —
          not just a rate prediction.
        </p>
      </div>

      <RequirementForm onSubmit={handleSubmit} submitting={submitting} />

      {error && <div className="error-banner">{error}</div>}

      {submitting && <div className="loading-state">Running forecast, feasibility, cost and risk engines…</div>}

      {report && !submitting && (
        <>
          <ExecutiveSummary rec={report.executiveRecommendation} />
          <ScenarioSimulator
            onRun={handleScenario}
            activeType={activeScenario}
            note={report.scenarioNote}
            loading={scenarioLoading}
          />
          <ForecastChart forecast={report.freightForecast} />
          <MarketEntryTiming timing={report.marketEntryTiming} />
          <VesselComparison alternatives={report.vesselRecommendation} />
          <PortFeasibility feasibility={report.portFeasibility} />
          <CostBreakdown cost={report.costBreakdown} />
          <ContractStrategy strategy={report.contractStrategy} />
          <RiskDashboard risk={report.riskAnalysis} />
          <Explainability explain={report.explainability} />
        </>
      )}

      {!report && !submitting && !error && (
        <div className="empty-state">Submit a cargo requirement above to generate a decision report.</div>
      )}
    </div>
  );
}
