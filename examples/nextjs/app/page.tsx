import Image from 'next/image';
import I_NEXT from '../assets/next.svg';
import I_TS_LOGO_256 from '../assets/ts-logo-256.png';

export default function Home() {
  return (
    <main>
      <Image src={I_NEXT} alt="Next.js Logo" />
      <Image src={I_TS_LOGO_256} alt="TypeScript Logo" />
    </main>
  );
}
