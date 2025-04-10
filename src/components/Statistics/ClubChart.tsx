import React from 'react';
import { Column } from '@ant-design/plots';
import { useModel } from 'umi';
import type { ClubStatistic } from '@/models/statistics';

const ClubChart: React.FC = () => {
	const { clubStatistics } = useModel('statistics');

	const chartData = clubStatistics.flatMap((stat: ClubStatistic) => [
		{ clubName: stat.clubName, type: 'Chờ duyệt', value: stat.pending },
		{ clubName: stat.clubName, type: 'Đã duyệt', value: stat.approved },
		{ clubName: stat.clubName, type: 'Từ chối', value: stat.rejected },
	]);

	const config = {
		data: chartData,
		isGroup: true,
		xField: 'clubName',
		yField: 'value',
		seriesField: 'type',
		color: ['#faad14', '#52c41a', '#ff4d4f'],
		label: {
			position: 'middle',
		},
		xAxis: {
			label: {
				autoRotate: true,
			},
		},
	};

	return <Column {...config} />;
};

export default ClubChart;
