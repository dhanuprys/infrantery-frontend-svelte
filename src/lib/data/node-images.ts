import CubeImage from '$lib/assets/nodes/cube.png';
import DockerImage from '$lib/assets/nodes/docker.jpg';
import UbuntuImage from '$lib/assets/nodes/ubuntu.png';
import PfSenseImage from '$lib/assets/nodes/pfsense.png';
import PostgresImage from '$lib/assets/nodes/postgres.png';

export const nodeImages = [
	{
		id: 'cube',
		src: CubeImage,
		alt: 'Default',
		label: 'Default'
	},
	{
		id: 'docker',
		src: DockerImage,
		alt: 'Docker',
		label: 'Docker',
		fit: 'cover'
	},
	{
		id: 'ubuntu',
		src: UbuntuImage,
		alt: 'Ubuntu',
		label: 'Ubuntu'
	},
	{
		id: 'pfsense',
		src: PfSenseImage,
		alt: 'PfSense',
		label: 'PfSense'
	},
	{
		id: 'postgres',
		src: PostgresImage,
		alt: 'Postgres',
		label: 'Postgres'
	}
];
