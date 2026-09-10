import { useState } from 'react';
import { Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

function App() {
	const [count, setCount] = useState(0);

	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<Badge
						className="mb-2 w-fit gap-1"
						variant="secondary">
						<Rocket className="size-3" />
						Vite + React
					</Badge>
					<CardTitle className="text-2xl">TVX TEMPLATE</CardTitle>
					<CardDescription>Ready to go</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						Edit <code className="text-foreground">src/App.jsx</code> and save to see
						changes. Add more UI primitives with{' '}
						<code className="text-foreground">npx shadcn@latest add</code>.
					</p>
				</CardContent>
				<CardFooter>
					<Button onClick={() => setCount((c) => c + 1)}>Count is {count}</Button>
				</CardFooter>
			</Card>
		</main>
	);
}

export default App;
