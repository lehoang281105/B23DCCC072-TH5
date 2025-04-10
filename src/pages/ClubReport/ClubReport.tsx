import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, Button, Spin, message, Modal } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import Chart from 'react-apexcharts';

interface Club {
	id: string;
	name: string;
	description: string;
	chuNhiem: string;
	active: boolean;
	Avatar?: string;
}

interface Application {
	id: string;
	name: string;
	email: string;
	phone: string;
	gender: string;
	address: string;
	skills: string;
	club: string;
	reason: string;
	status: 'Pending' | 'Approved' | 'Rejected';
	note?: string;
	history?: string[];
}

interface StatusCount {
	pending: number;
	approved: number;
	rejected: number;
}

interface ChartData {
	clubName: string;
	status: string;
	count: number;
}

const ClubReport: React.FC = () => {
	const [clubs, setClubs] = useState<Club[]>([]);
	const [applications, setApplications] = useState<Application[]>([]);
	const [selectedClub, setSelectedClub] = useState<string | null>(null);
	const [statusCount, setStatusCount] = useState<StatusCount>({ pending: 0, approved: 0, rejected: 0 });
	const [chartData, setChartData] = useState<ChartData[]>([]);
	const [chartOptions, setChartOptions] = useState({});
	const [chartSeries, setChartSeries] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [exportLoading, setExportLoading] = useState<boolean>(false);
	const [resetLoading, setResetLoading] = useState<boolean>(false);

	// Prepare chart data for all clubs
	const prepareChartData = (clubsData: Club[], applicationsData: Application[]) => {
		const data: ChartData[] = [];
		const clubNames: string[] = [];
		const pendingData: number[] = [];
		const approvedData: number[] = [];
		const rejectedData: number[] = [];

		clubsData.forEach((club) => {
			const clubApplications = applicationsData.filter((app) => {
				// In this application, club ID is stored in the application's club field
				return app.club === club.id;
			});

			const pending = clubApplications.filter((app) => app.status === 'Pending').length;
			const approved = clubApplications.filter((app) => app.status === 'Approved').length;
			const rejected = clubApplications.filter((app) => app.status === 'Rejected').length;

			// Only add if there are any applications
			if (pending > 0 || approved > 0 || rejected > 0) {
				clubNames.push(club.name);
				pendingData.push(pending);
				approvedData.push(approved);
				rejectedData.push(rejected);

				// Also store the original format for potential future use
				if (pending > 0) {
					data.push({ clubName: club.name, status: 'Pending', count: pending });
				}
				if (approved > 0) {
					data.push({ clubName: club.name, status: 'Approved', count: approved });
				}
				if (rejected > 0) {
					data.push({ clubName: club.name, status: 'Rejected', count: rejected });
				}
			}
		});

		setChartData(data);

		// Set ApexCharts options and series
		setChartOptions({
			chart: {
				type: 'bar',
				stacked: false,
				height: 350,
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent'],
			},
			xaxis: {
				categories: clubNames,
				title: {
					text: 'Câu lạc bộ',
				},
			},
			yaxis: {
				title: {
					text: 'Số đơn đăng ký',
				},
			},
			fill: {
				opacity: 1,
			},
			tooltip: {
				y: {
					formatter: function (val: number) {
						return val + ' đơn';
					},
				},
			},
			colors: ['#108ee9', '#52c41a', '#f5222d'],
			legend: {
				position: 'top',
			},
		});

		setChartSeries([
			{
				name: 'Pending',
				data: pendingData,
			},
			{
				name: 'Approved',
				data: approvedData,
			},
			{
				name: 'Rejected',
				data: rejectedData,
			},
		]);
	};

	// Fetch clubs and applications
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [clubsResponse, applicationsResponse] = await Promise.all([
					fetch('https://67f72b6542d6c71cca643b99.mockapi.io/Clb').then((res) => res.json()),
					fetch('https://67f74a7a42d6c71cca64966c.mockapi.io/students').then((res) => res.json()),
				]);

				setClubs(clubsResponse);
				setApplications(applicationsResponse);

				// Calculate statistics
				const pending = applicationsResponse.filter((app: Application) => app.status === 'Pending').length;
				const approved = applicationsResponse.filter((app: Application) => app.status === 'Approved').length;
				const rejected = applicationsResponse.filter((app: Application) => app.status === 'Rejected').length;

				setStatusCount({ pending, approved, rejected });

				// Prepare chart data
				prepareChartData(clubsResponse, applicationsResponse);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Export members to Excel file
	const exportToExcel = async () => {
		setExportLoading(true);
		try {
			// Filter approved members
			const approvedMembers = applications.filter(
				(app) => app.status === 'Approved' && (selectedClub ? app.club === selectedClub : true),
			);

			if (approvedMembers.length === 0) {
				message.warning('Không có thành viên nào được duyệt để xuất!');
				setExportLoading(false);
				return;
			}

			// Map members to a more readable format for Excel
			const membersData = approvedMembers.map((member) => {
				const clubObj = clubs.find((c) => c.id === member.club);
				const clubName = clubObj ? clubObj.name : 'Không xác định';

				return {
					'Họ tên': member.name,
					Email: member.email,
					SĐT: member.phone,
					'Giới tính': member.gender,
					'Địa chỉ': member.address,
					'Sở trường': member.skills,
					'Câu lạc bộ': clubName,
					'Lý do đăng ký': member.reason,
				};
			});

			// Create a worksheet and workbook
			const worksheet = XLSX.utils.json_to_sheet(membersData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

			// Generate Excel file
			const selectedClubName = selectedClub
				? clubs.find((c) => c.id === selectedClub)?.name || 'selected-club'
				: 'all-clubs';

			XLSX.writeFile(workbook, `Thanh_Vien_${selectedClubName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
			message.success('Xuất danh sách thành công!');
		} catch (error) {
			console.error('Error exporting to Excel:', error);
			message.error('Lỗi khi xuất dữ liệu. Vui lòng thử lại!');
		} finally {
			setExportLoading(false);
		}
	};

	// Hàm xóa toàn bộ dữ liệu
	const resetAllData = async () => {
		setResetLoading(true);

		try {
			// Xác nhận trước khi xóa
			Modal.confirm({
				title: 'Xóa toàn bộ dữ liệu',
				content: 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể khôi phục.',
				okText: 'Xóa',
				okButtonProps: { danger: true },
				cancelText: 'Hủy',
				onOk: async () => {
					try {
						// 1. Lấy toàn bộ danh sách sinh viên
						const studentsResponse = await fetch('https://67f74a7a42d6c71cca64966c.mockapi.io/students');
						const studentsData = await studentsResponse.json();

						// 2. Xóa từng sinh viên
						await Promise.all(
							studentsData.map((student: { id: string }) =>
								fetch(`https://67f74a7a42d6c71cca64966c.mockapi.io/students/${student.id}`, {
									method: 'DELETE',
								}),
							),
						);

						// 3. Lấy danh sách câu lạc bộ
						const clubsResponse = await fetch('https://67f72b6542d6c71cca643b99.mockapi.io/Clb');
						const clubsData = await clubsResponse.json();

						// 4. Xóa từng câu lạc bộ
						await Promise.all(
							clubsData.map((club: { id: string }) =>
								fetch(`https://67f72b6542d6c71cca643b99.mockapi.io/Clb/${club.id}`, {
									method: 'DELETE',
								}),
							),
						);

						message.success('Đã xóa toàn bộ dữ liệu thành công!');

						// Làm mới dữ liệu trên trang
						setChartData([]);
						setChartSeries([]);
						setStatusCount({ pending: 0, approved: 0, rejected: 0 });
						setClubs([]);
						setApplications([]);
					} catch (error) {
						console.error('Lỗi khi xóa dữ liệu:', error);
						message.error('Đã xảy ra lỗi khi xóa dữ liệu!');
					} finally {
						setResetLoading(false);
					}
				},
				onCancel: () => {
					setResetLoading(false);
				},
			});
		} catch (error) {
			console.error('Lỗi:', error);
			setResetLoading(false);
		}
	};

	return (
		<div style={{ padding: '24px' }}>
			<h1>Báo cáo và thống kê</h1>

			{/* Admin Actions */}
			<Card title='Quản trị' style={{ marginBottom: '24px' }}>
				<Button danger onClick={resetAllData} loading={resetLoading} icon={<DeleteOutlined />}>
					Xóa toàn bộ dữ liệu
				</Button>
				<p style={{ marginTop: '10px', color: 'red' }}>
					Lưu ý: Hành động này sẽ xóa tất cả dữ liệu sinh viên và câu lạc bộ. Không thể khôi phục sau khi xóa.
				</p>
			</Card>

			{loading ? (
				<div style={{ textAlign: 'center', padding: '50px' }}>
					<Spin size='large' />
				</div>
			) : (
				<>
					{/* Statistics Cards */}
					<Row gutter={16} style={{ marginBottom: '24px' }}>
						<Col span={6}>
							<Card>
								<Statistic title='Tổng số câu lạc bộ' value={clubs.length} />
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic title='Số đơn Pending' value={statusCount.pending} valueStyle={{ color: '#108ee9' }} />
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic title='Số đơn Approved' value={statusCount.approved} valueStyle={{ color: '#52c41a' }} />
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic title='Số đơn Rejected' value={statusCount.rejected} valueStyle={{ color: '#f5222d' }} />
							</Card>
						</Col>
					</Row>

					{/* Chart Section */}
					<Card title='Biểu đồ số đơn đăng ký theo từng câu lạc bộ' style={{ marginBottom: '24px' }}>
						{chartSeries[0]?.data.length > 0 || chartSeries[1]?.data.length > 0 || chartSeries[2]?.data.length > 0 ? (
							<Chart options={chartOptions} series={chartSeries} type='bar' height={350} />
						) : (
							<div style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu để hiển thị</div>
						)}
					</Card>

					{/* Export Section */}
					<Card title='Xuất danh sách thành viên'>
						<Row gutter={16} align='middle'>
							<Col span={12}>
								<Select
									placeholder='Chọn câu lạc bộ để xuất'
									style={{ width: '100%' }}
									onChange={(value) => setSelectedClub(value)}
									allowClear
									options={clubs.map((club) => ({ value: club.id, label: club.name }))}
								/>
							</Col>
							<Col span={12}>
								<Button type='primary' icon={<DownloadOutlined />} onClick={exportToExcel} loading={exportLoading}>
									Xuất danh sách {selectedClub ? 'của câu lạc bộ đã chọn' : 'tất cả câu lạc bộ'}
								</Button>
							</Col>
						</Row>
					</Card>
				</>
			)}
		</div>
	);
};

export default ClubReport;
