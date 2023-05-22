import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('../components/Editor'), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <Editor />
    </div>
  )
}
