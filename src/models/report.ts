import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getClubReports, addClubReport, updateClubReport, deleteClubReport } from '@/services/report';
import { ClubData } from './club';

export interface ReportData {
	id: string;
	clubId: string;
	title: string;
	content: string;
	date: string;
	participants: number;
	images: string[];
	status: 'active' | 'inactive';
}

export default () => {
	const [reports, setReports] = useState<ReportData[]>([]);
	const [clubs, setClubs] = useState<ClubData[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isViewMode, setIsViewMode] = useState(false);
	const [editingReport, setEditingReport] = useState<ReportData | null>(null);
	const [refresh, setRefresh] = useState(false);
	const [previewImages, setPreviewImages] = useState<string[]>([]);
	const [reportImages, setReportImages] = useState<string[]>([]);
	const [imageLoading, setImageLoading] = useState(false);

	const fetchReports = async () => {
		try {
			const data = await getClubReports();
			setReports(data);
		} catch (err) {
			console.error('Error fetching reports:', err);
		}
	};

	useEffect(() => {
		fetchReports();
	}, [refresh]);

	const handleDelete = async (id: string) => {
		try {
			await deleteClubReport(id);
			setReports((prev) => prev.filter((report) => report.id !== id));
			message.success('Xóa báo cáo thành công!');
		} catch (err) {
			console.error('Error deleting report:', err);
			message.error('Có lỗi xảy ra khi xóa báo cáo!');
		}
	};

	const handleSave = async (values: any) => {
		try {
			const dataToSave = {
				...values,
				images: reportImages,
			};

			if (editingReport) {
				await updateClubReport(editingReport.id, dataToSave);
				message.success('Cập nhật báo cáo thành công!');
			} else {
				await addClubReport(dataToSave);
				message.success('Thêm báo cáo mới thành công!');
			}

			setRefresh(!refresh);
			resetState();
		} catch (err) {
			console.error('Error saving report:', err);
			message.error('Có lỗi xảy ra khi lưu báo cáo!');
		}
	};

	const resetState = () => {
		setEditingReport(null);
		setPreviewImages([]);
		setReportImages([]);
		setIsModalOpen(false);
	};

	const handleViewDetails = (report: ReportData) => {
		setEditingReport(report);
		setPreviewImages(report.images || []);
		setReportImages(report.images || []);
		setIsViewMode(true);
		setIsModalOpen(true);
	};

	const handleEdit = (report: ReportData) => {
		setEditingReport(report);
		setPreviewImages(report.images || []);
		setReportImages(report.images || []);
		setIsViewMode(false);
		setIsModalOpen(true);
	};

	return {
		reports,
		clubs,
		isModalOpen,
		isViewMode,
		editingReport,
		refresh,
		previewImages,
		reportImages,
		imageLoading,
		setReports,
		setClubs,
		setIsModalOpen,
		setIsViewMode,
		setEditingReport,
		setRefresh,
		setPreviewImages,
		setReportImages,
		setImageLoading,
		fetchReports,
		handleDelete,
		handleSave,
		resetState,
		handleViewDetails,
		handleEdit,
	};
};
