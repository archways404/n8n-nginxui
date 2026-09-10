import { ShieldAlert } from 'lucide-react';
import { DeploySiteForm } from '@/components/deploy-site-form';

function App() {
	return (
		<main className="flex min-h-svh flex-col items-center gap-6 p-6 py-12">
			<DeploySiteForm />

			<div className="flex max-w-xl items-start gap-2 text-xs text-muted-foreground">
				<ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
				<p>
					This page grants no auth of its own — it must be served from a domain
					covered by voidAuth (add it under{' '}
					<span className="font-mono">auth.k14net.org → ProxyAuth Domains</span>{' '}
					so only <span className="font-mono">auth_admins</span> can reach it).
				</p>
			</div>
		</main>
	);
}

export default App;
