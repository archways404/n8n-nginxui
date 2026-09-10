import { useMemo, useState } from 'react';
import {
	CheckCircle2,
	Copy,
	Globe,
	Loader2,
	Network,
	RotateCcw,
	Send,
	SquareArrowOutUpRight,
	XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const ENDPOINT = 'https://n8n.k14net.org/webhook/new-site';

const TARGET_IPS = [
	{ value: '192.168.1.169', note: 'default' },
	{ value: '192.168.1.248', note: 'infra' },
	{ value: '192.168.1.221', note: 'db' },
	{ value: '192.168.1.170', note: 'coolify' },
];

const DEFAULT_UMAMI_ID = '8e4fb3f7-8706-4349-9c40-4be5b4d94a79';
const CUSTOM_IP = '__custom__';

const TYPES = [
	{ value: 'proxy', label: 'Proxy', icon: Network },
	{ value: 'redirect', label: 'Redirect', icon: SquareArrowOutUpRight },
];

function autoLabel(subdomain) {
	const first = subdomain.trim().split('.')[0];
	return first ? first.toUpperCase() : '';
}

function emptyToUndefined(value) {
	const trimmed = value.trim();
	return trimmed ? trimmed : undefined;
}

export function DeploySiteForm() {
	const [type, setType] = useState('proxy');
	const [subdomain, setSubdomain] = useState('');
	const [label, setLabel] = useState('');
	const [targetIp, setTargetIp] = useState(TARGET_IPS[0].value);
	const [customIp, setCustomIp] = useState('');
	const [targetPort, setTargetPort] = useState('');
	const [umamiWebsiteId, setUmamiWebsiteId] = useState(DEFAULT_UMAMI_ID);
	const [redirectUrl, setRedirectUrl] = useState('');

	const [formError, setFormError] = useState('');
	const [status, setStatus] = useState('idle'); // idle | loading | success | error
	const [response, setResponse] = useState(null); // { statusCode, body }
	const [copied, setCopied] = useState(false);

	const effectiveIp = targetIp === CUSTOM_IP ? customIp : targetIp;

	const payload = useMemo(() => {
		const body = {
			type,
			subdomain: emptyToUndefined(subdomain),
			label: emptyToUndefined(label),
		};
		if (type === 'proxy') {
			body.target_ip = emptyToUndefined(effectiveIp);
			body.target_port = targetPort ? Number(targetPort) : undefined;
		} else {
			body.umami_website_id = emptyToUndefined(umamiWebsiteId);
			body.redirect_url = emptyToUndefined(redirectUrl);
		}
		return Object.fromEntries(
			Object.entries(body).filter(([, v]) => v !== undefined),
		);
	}, [type, subdomain, label, effectiveIp, targetPort, umamiWebsiteId, redirectUrl]);

	function validate() {
		if (!subdomain.trim()) return 'Subdomain is required.';
		if (type === 'proxy') {
			if (!effectiveIp.trim()) return 'Target IP is required.';
			const port = Number(targetPort);
			if (!targetPort || !Number.isInteger(port) || port < 1 || port > 65535) {
				return 'Target port must be a number between 1 and 65535.';
			}
		} else {
			if (!redirectUrl.trim()) return 'Redirect URL is required.';
			try {
				new URL(redirectUrl.trim());
			} catch {
				return 'Redirect URL must be a valid, absolute URL.';
			}
		}
		return '';
	}

	function resetForm() {
		setType('proxy');
		setSubdomain('');
		setLabel('');
		setTargetIp(TARGET_IPS[0].value);
		setCustomIp('');
		setTargetPort('');
		setUmamiWebsiteId(DEFAULT_UMAMI_ID);
		setRedirectUrl('');
		setFormError('');
		setStatus('idle');
		setResponse(null);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		const error = validate();
		if (error) {
			setFormError(error);
			setStatus('idle');
			setResponse(null);
			return;
		}
		setFormError('');
		setStatus('loading');
		setResponse(null);

		try {
			const res = await fetch(ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const text = await res.text();
			let body = text;
			try {
				body = text ? JSON.parse(text) : null;
			} catch {
				// leave body as raw text
			}
			setResponse({ statusCode: res.status, body });
			setStatus(res.ok ? 'success' : 'error');
		} catch (err) {
			setResponse({ statusCode: null, body: err instanceof Error ? err.message : String(err) });
			setStatus('error');
		}
	}

	async function copyPayload() {
		try {
			await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// clipboard unavailable, ignore
		}
	}

	return (
		<Card className="w-full max-w-xl ring-1 ring-foreground/10">
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="text-xl">New Site</CardTitle>
					<div className="flex items-center gap-1.5 rounded-full border border-input bg-input/20 px-2.5 py-1 text-xs text-muted-foreground">
						<Globe className="size-3.5" />
						<span className="font-mono">POST /webhook/new-site</span>
					</div>
				</div>
				<p className="text-sm text-muted-foreground">
					Push a new reverse-proxy or redirect deployment to{' '}
					<span className="font-mono text-foreground/80">n8n.k14net.org</span>.
				</p>
			</CardHeader>

			<CardContent className="flex flex-col gap-5">
				{/* Type selector */}
				<div className="flex flex-col gap-1.5">
					<Label>Type</Label>
					<div className="inline-flex w-fit rounded-lg border border-input bg-input/20 p-1">
						{TYPES.map(({ value, label: typeLabel, icon: Icon }) => (
							<button
								key={value}
								type="button"
								onClick={() => setType(value)}
								aria-pressed={type === value}
								className={cn(
									'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
									type === value
										? 'bg-violet-600 text-white shadow-sm'
										: 'text-muted-foreground hover:text-foreground',
								)}>
								<Icon className="size-3.5" />
								{typeLabel}
							</button>
						))}
					</div>
				</div>

				{/* Subdomain + label */}
				<div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="subdomain">Subdomain</Label>
						<Input
							id="subdomain"
							placeholder="app.k14net.org"
							value={subdomain}
							onChange={(e) => setSubdomain(e.target.value)}
							className="font-mono"
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="label">Label</Label>
						<Input
							id="label"
							placeholder={autoLabel(subdomain) || 'Auto from subdomain'}
							value={label}
							onChange={(e) => setLabel(e.target.value)}
						/>
					</div>
				</div>

				<Separator />

				{type === 'proxy' ? (
					<div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="target-ip">Target IP</Label>
							<Select value={targetIp} onValueChange={setTargetIp}>
								<SelectTrigger id="target-ip" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{TARGET_IPS.map(({ value, note }) => (
										<SelectItem key={value} value={value}>
											<span className="font-mono">{value}</span>
											<span className="text-muted-foreground">— {note}</span>
										</SelectItem>
									))}
									<SelectItem value={CUSTOM_IP}>Custom…</SelectItem>
								</SelectContent>
							</Select>
							{targetIp === CUSTOM_IP && (
								<Input
									placeholder="10.0.0.5"
									value={customIp}
									onChange={(e) => setCustomIp(e.target.value)}
									className="mt-1 font-mono"
								/>
							)}
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="target-port">Target port</Label>
							<Input
								id="target-port"
								type="number"
								min="1"
								max="65535"
								placeholder="8080"
								value={targetPort}
								onChange={(e) => setTargetPort(e.target.value)}
								className="font-mono"
							/>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="redirect-url">Redirect URL</Label>
							<Input
								id="redirect-url"
								placeholder="https://example.com/landing"
								value={redirectUrl}
								onChange={(e) => setRedirectUrl(e.target.value)}
								className="font-mono"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="umami-id">Umami website ID</Label>
							<Input
								id="umami-id"
								placeholder={DEFAULT_UMAMI_ID}
								value={umamiWebsiteId}
								onChange={(e) => setUmamiWebsiteId(e.target.value)}
								className="font-mono"
							/>
						</div>
					</div>
				)}

				<Separator />

				{/* Live JSON preview */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Label className="text-muted-foreground">Payload preview</Label>
						<Button
							type="button"
							variant="ghost"
							size="xs"
							onClick={copyPayload}>
							{copied ? <CheckCircle2 className="size-3" /> : <Copy className="size-3" />}
							{copied ? 'Copied' : 'Copy'}
						</Button>
					</div>
					<pre className="max-h-48 overflow-auto rounded-lg border border-input bg-input/10 p-3 font-mono text-xs text-muted-foreground">
						{JSON.stringify(payload, null, 2)}
					</pre>
				</div>

				{formError && (
					<Alert variant="destructive">
						<XCircle />
						<AlertTitle>{formError}</AlertTitle>
					</Alert>
				)}

				{status === 'success' && (
					<Alert>
						<CheckCircle2 className="text-emerald-500" />
						<AlertTitle>
							Deployed — n8n responded {response?.statusCode ?? ''}
						</AlertTitle>
						{response?.body != null && (
							<AlertDescription>
								<pre className="mt-1 max-h-40 overflow-auto font-mono text-xs">
									{typeof response.body === 'string'
										? response.body
										: JSON.stringify(response.body, null, 2)}
								</pre>
							</AlertDescription>
						)}
					</Alert>
				)}

				{status === 'error' && (
					<Alert variant="destructive">
						<XCircle />
						<AlertTitle>
							{response?.statusCode
								? `n8n responded ${response.statusCode}`
								: 'Request failed'}
						</AlertTitle>
						{response?.body != null && (
							<AlertDescription>
								<pre className="mt-1 max-h-40 overflow-auto font-mono text-xs">
									{typeof response.body === 'string'
										? response.body
										: JSON.stringify(response.body, null, 2)}
								</pre>
							</AlertDescription>
						)}
					</Alert>
				)}
			</CardContent>

			<CardFooter className="justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={resetForm}
					disabled={status === 'loading'}>
					<RotateCcw />
					Reset
				</Button>
				<Button
					type="button"
					onClick={handleSubmit}
					disabled={status === 'loading'}
					className="bg-violet-600 text-white hover:bg-violet-500">
					{status === 'loading' ? <Loader2 className="animate-spin" /> : <Send />}
					{status === 'loading' ? 'Deploying…' : 'Deploy site'}
				</Button>
			</CardFooter>
		</Card>
	);
}
