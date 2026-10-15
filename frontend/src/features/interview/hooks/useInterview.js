import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api";
import { useContext } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        let response = null;
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            if (response?.interviewReport) {
                setReport(response.interviewReport);
                setReports(prev => [response.interviewReport, ...(Array.isArray(prev) ? prev : [])]);
            }
        } catch (error) {
            console.error("Failed to generate report:", error);
            throw error;
        } finally {
            setLoading(false);
        }

        return response?.interviewReport;
    };

    const getReportById = async (id) => {
        const targetId = id || interviewId;
        if (!targetId) return null;

        setLoading(true);
        let response = null;
        try {
            response = await getInterviewReportById(targetId);
            if (response?.interviewReport) {
                setReport(response.interviewReport);
            }
        } catch (error) {
            console.error("Failed to fetch report:", error);
        } finally {
            setLoading(false);
        }
        return response?.interviewReport;
    };

    const getReports = async () => {
        setLoading(true);
        let response = null;
        try {
            response = await getAllInterviewReports();
            const list = response?.interviewReports || [];
            setReports(list);
            return list;
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            setReports([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getResumePdf = async (reportId) => {
        const targetId = reportId || interviewId;
        if (!targetId) return;

        setLoading(true);
        try {
            const response = await generateResumePdf({ interviewReportId: targetId });
            const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `resume_${targetId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download resume PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        setLoading,
        report,
        setReport,
        reports: reports || [],
        setReports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    };
};