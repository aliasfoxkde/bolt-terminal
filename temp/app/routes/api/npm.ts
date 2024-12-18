import { json } from '@remix-run/node';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function action({ request }: { request: Request }) {
  const { args } = await request.json();
  
  try {
    const { stdout, stderr } = await execAsync(`npm ${args.join(' ')}`);
    return json({ output: stdout || stderr });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}