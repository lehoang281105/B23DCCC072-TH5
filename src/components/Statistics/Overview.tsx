import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { useModel } from 'umi';

const Overview: React.FC = () => {
	const { statistics } = useModel('statistics');

	return (
		<Row gutter={16}>
			<Col span={6}>
				<Card>
					<Statistic title='Tổng số CLB' value={statistics.totalClubs} />
				</Card>
			</Col>
			<Col span={6}>
				<Card>
					<Statistic title='Chờ duyệt' value={statistics.pendingRegistrations} valueStyle={{ color: '#faad14' }} />
				</Card>
			</Col>
			<Col span={6}>
				<Card>
					<Statistic title='Đã duyệt' value={statistics.approvedRegistrations} valueStyle={{ color: '#52c41a' }} />
				</Card>
			</Col>
			<Col span={6}>
				<Card>
					<Statistic title='Từ chối' value={statistics.rejectedRegistrations} valueStyle={{ color: '#ff4d4f' }} />
				</Card>
			</Col>
		</Row>
	);
};

export default Overview;
