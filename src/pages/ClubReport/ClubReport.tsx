// (Hoặc đặt file này ở vị trí phù hợp trong cấu trúc thư mục của bạn)

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Select, Button, message, Empty } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/charts'; // Import Column Chart
import * as XLSX from 'xlsx'; // Import thư viện xlsx

const { Option } = Select;

// --- Interfaces (Nên định nghĩa ở một file chung nếu dùng nhiều nơi) ---
interface Club {
	id: string;
	avatar: string; // Giữ lại để khớp với định nghĩa Club ban đầu của bạn
	name: string;
	description: string;
	chuNhiem: string;
	active: boolean;
}

interface Application {
	id: string;
	name: string; // Đổi thành fullName nếu API trả về fullName
	email: string;
	phone: string;
	gender: string;
	address: string;
	skills: string;
	club: string; // QUAN TRỌNG: Trường này chứa ID hay Tên CLB từ API /students? Giả sử là ID dựa trên code ClubMembers PUT.
	reason: string;
	status: 'Pending' | 'Approved' | 'Rejected';
	note?: string;
	history?: string[];
}

// Định nghĩa kiểu dữ liệu cho thống kê
interface OverallStats {
	totalClubs: number;
	totalApplications: number;
	pendingCount: number;
	approvedCount: number;
	rejectedCount: number;
}

// Định nghĩa kiểu dữ liệu cho biểu đồ
interface ApplicationStatsByClub {
	clubName: string;
	status: 'Pending' | 'Approved' | 'Rejected';
	count: number;
}

// API Endpoints (Nên đặt vào file constants/config)
const CLUBS_API_URL = 'https://67f72b6542d6c71cca643b99.mockapi.io/Clb';
const APPLICATIONS_API_URL = 'https://67f74a7a42d6c71cca64966c.mockapi.io/students';

const ReportPage: React.FC = () => {
	const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
	const [chartData, setChartData] = useState<ApplicationStatsByClub[]>([]);
	const [clubList, setClubList] = useState<{ id: string; name: string }[]>([]);
	const [selectedClubIdForExport, setSelectedClubIdForExport] = useState<string | undefined>(undefined);

	const [loadingStats, setLoadingStats] = useState<boolean>(true);
	const [loadingChart, setLoadingChart] = useState<boolean>(true);
	const [loadingClubs, setLoadingClubs] = useState<boolean>(true); // Loading cho dropdown export
	const [exporting, setExporting] = useState<boolean>(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoadingStats(true);
			setLoadingChart(true);
			setLoadingClubs(true);

			try {
				// Fetch đồng thời clubs và applications
				const [clubResponse, applicationResponse] = await Promise.all([
					fetch(CLUBS_API_URL),
					fetch(APPLICATIONS_API_URL),
				]);

				if (!clubResponse.ok || !applicationResponse.ok) {
					throw new Error('Failed to fetch data');
				}

				const clubs: Club[] = await clubResponse.json();
				const applications: Application[] = await applicationResponse.json();

				// --- 1. Tính toán Thống kê chung ---
				const totalClubs = clubs.length;
				const totalApplications = applications.length;
				let pendingCount = 0;
				let approvedCount = 0;
				let rejectedCount = 0;

				applications.forEach((app) => {
					if (app.status === 'Pending') pendingCount++;
					else if (app.status === 'Approved') approvedCount++;
					else if (app.status === 'Rejected') rejectedCount++;
				});

				setOverallStats({
					totalClubs,
					totalApplications,
					pendingCount,
					approvedCount,
					rejectedCount,
				});
				setLoadingStats(false);

				// --- 2. Chuẩn bị dữ liệu cho Biểu đồ cột ---
				const statsMap: {
					[clubId: string]: { clubName: string; Pending: number; Approved: number; Rejected: number };
				} = {};
				const clubNameMap: { [clubId: string]: string } = {};

				// Tạo map ID -> Tên CLB và khởi tạo statsMap
				clubs.forEach((club) => {
					clubNameMap[club.id] = club.name;
					statsMap[club.id] = { clubName: club.name, Pending: 0, Approved: 0, Rejected: 0 };
				});

				// Đếm số đơn theo trạng thái cho từng CLB
				applications.forEach((app) => {
					// Giả sử app.club chứa ID của CLB
					const clubId = app.club;
					if (statsMap[clubId] && app.status) {
						if (app.status === 'Pending' || app.status === 'Approved' || app.status === 'Rejected') {
							// Chỉ tăng nếu status hợp lệ
							statsMap[clubId][app.status]++;
						}
					}
					// Nếu app.club chứa Tên CLB, bạn cần tìm ID tương ứng từ `clubs` hoặc điều chỉnh logic
				});

				// Chuyển đổi map thành định dạng mảng cho biểu đồ
				const finalChartData: ApplicationStatsByClub[] = [];
				Object.values(statsMap).forEach((clubStat) => {
					if (clubStat.Pending > 0) {
						finalChartData.push({ clubName: clubStat.clubName, status: 'Pending', count: clubStat.Pending });
					}
					if (clubStat.Approved > 0) {
						finalChartData.push({ clubName: clubStat.clubName, status: 'Approved', count: clubStat.Approved });
					}
					if (clubStat.Rejected > 0) {
						finalChartData.push({ clubName: clubStat.clubName, status: 'Rejected', count: clubStat.Rejected });
					}
				});

				setChartData(finalChartData);
				setLoadingChart(false);

				// --- 3. Chuẩn bị danh sách CLB cho Export dropdown ---
				const simpleClubList = clubs.map((club) => ({ id: club.id, name: club.name }));
				setClubList(simpleClubList);
				setLoadingClubs(false);
			} catch (error) {
				console.error('Error fetching report data:', error);
				message.error('Lỗi tải dữ liệu báo cáo!');
				setLoadingStats(false);
				setLoadingChart(false);
				setLoadingClubs(false);
			}
		};

		fetchData();
	}, []); // Chỉ fetch một lần khi component mount

	// --- Cấu hình cho Column Chart ---
	const chartConfig = {
		data: chartData,
		xField: 'clubName', // Trục X là tên CLB
		yField: 'count', // Trục Y là số lượng
		seriesField: 'status', // Tạo cột riêng cho mỗi trạng thái
		isGroup: true, // Nhóm các cột theo clubName
		columnStyle: {
			radius: [5, 5, 0, 0],
		},
		label: {
			position: 'middle' as const, // 'top', 'bottom', 'middle'
			layout: [
				{ type: 'interval-adjust-position' as const },
				{ type: 'interval-hide-overlap' as const },
				{ type: 'adjust-color' as const },
			],
		},
		legend: {
			position: 'top-right' as const,
		},
		tooltip: {
			shared: true,
			showMarkers: false,
		},
		interactions: [{ type: 'active-region' as const, enable: false }],
		// Đặt chiều cao cố định nếu cần
		height: 400,
	};

	// --- Xử lý Export Excel ---
	const handleExport = async () => {
		if (!selectedClubIdForExport) {
			message.warning('Vui lòng chọn Câu lạc bộ để xuất danh sách.');
			return;
		}

		setExporting(true);
		try {
			// Fetch lại danh sách applications (vì MockAPI không có filter mạnh)
			const response = await fetch(APPLICATIONS_API_URL);
			if (!response.ok) {
				throw new Error('Failed to fetch applications for export');
			}
			const allApplications: Application[] = await response.json();

			// Lọc thành viên đã duyệt của CLB được chọn
			// GIẢ ĐỊNH: application.club lưu trữ ID của CLB
			const approvedMembers = allApplications.filter(
				(app) => app.status === 'Approved' && app.club === selectedClubIdForExport,
			);

			if (!approvedMembers || approvedMembers.length === 0) {
				message.info('Không có thành viên nào (đã duyệt) trong câu lạc bộ này để xuất.');
				setExporting(false);
				return;
			}

			// Chuẩn bị dữ liệu cho file Excel
			const dataToExport = approvedMembers.map((member) => ({
				'Họ tên': member.name, // Đảm bảo tên trường khớp với Application interface
				Email: member.email,
				'Số điện thoại': member.phone,
				'Giới tính': member.gender === 'Male' ? 'Nam' : 'Nữ',
				'Địa chỉ': member.address,
				'Sở trường': member.skills,
				// Thêm các cột khác nếu cần
			}));

			// Tạo worksheet và workbook
			const ws = XLSX.utils.json_to_sheet(dataToExport);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Danh sách Thành viên'); // Tên sheet

			// Lấy tên CLB để đặt tên file
			const selectedClub = clubList.find((club) => club.id === selectedClubIdForExport);
			const clubNameForFile = selectedClub ? selectedClub.name.replace(/[^a-zA-Z0-9]/g, '_') : 'CLB'; // Xử lý tên file
			const fileName = `DanhSachThanhVien_${clubNameForFile}.xlsx`;

			// Xuất file
			XLSX.writeFile(wb, fileName);

			message.success('Xuất danh sách thành viên thành công!');
		} catch (error) {
			console.error('Export error:', error);
			message.error('Đã xảy ra lỗi khi xuất danh sách.');
		} finally {
			setExporting(false);
		}
	};

	return (
		<div>
			{' '}
			{/* Hoặc dùng <PageContainer> nếu bạn có ProLayout */}
			{/* 1. Thống kê chung */}
			<Spin spinning={loadingStats}>
				<Card title='Thống kê chung' style={{ marginBottom: 24 }}>
					{overallStats ? (
						<Row gutter={[16, 16]}>
							{' '}
							{/* Thêm gutter dọc */}
							<Col xs={24} sm={12} md={8} lg={6} xl={4}>
								<Statistic title='Tổng số CLB' value={overallStats.totalClubs} />
							</Col>
							<Col xs={24} sm={12} md={8} lg={6} xl={5}>
								<Statistic title='Tổng đơn đăng ký' value={overallStats.totalApplications} />
							</Col>
							<Col xs={24} sm={8} md={8} lg={4} xl={5}>
								<Statistic title='Chờ duyệt' value={overallStats.pendingCount} />
							</Col>
							<Col xs={24} sm={8} md={8} lg={4} xl={5}>
								<Statistic title='Đã duyệt' value={overallStats.approvedCount} />
							</Col>
							<Col xs={24} sm={8} md={8} lg={4} xl={5}>
								<Statistic title='Bị từ chối' value={overallStats.rejectedCount} />
							</Col>
						</Row>
					) : (
						!loadingStats && <Empty description='Không có dữ liệu thống kê chung' />
					)}
				</Card>
			</Spin>
			{/* 2. Biểu đồ cột */}
			<Card title='Số đơn đăng ký theo từng CLB' style={{ marginBottom: 24 }}>
				<Spin spinning={loadingChart}>
					{chartData && chartData.length > 0 ? (
						<Column {...chartConfig} />
					) : (
						!loadingChart && <Empty description='Không có dữ liệu để hiển thị biểu đồ' />
					)}
				</Spin>
			</Card>
			{/* 3. Xuất Excel */}
			<Card title='Xuất danh sách thành viên (Đã duyệt)'>
				<Row gutter={[16, 16]} align='bottom'>
					<Col>
						<label style={{ marginRight: 8, display: 'block', marginBottom: 4 }}>Chọn Câu lạc bộ:</label>
						<Select
							style={{ width: 250 }}
							placeholder='Chọn CLB để xuất dữ liệu'
							onChange={(value) => setSelectedClubIdForExport(value)}
							allowClear
							showSearch
							optionFilterProp='children'
							filterOption={(input, option) =>
								(option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
							}
							loading={loadingClubs}
							value={selectedClubIdForExport}
							disabled={loadingClubs || exporting} // Disable khi đang tải club hoặc đang export
						>
							{clubList.map((club) => (
								<Option key={club.id} value={club.id}>
									{club.name}
								</Option>
							))}
						</Select>
					</Col>
					<Col>
						<Button
							type='primary'
							icon={<DownloadOutlined />}
							onClick={handleExport}
							loading={exporting}
							disabled={!selectedClubIdForExport || exporting || loadingClubs} // Disable khi chưa chọn, đang export hoặc đang load clubs
						>
							Xuất Excel
						</Button>
					</Col>
				</Row>
			</Card>
		</div>
	);
};

export default ReportPage;
