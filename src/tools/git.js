const fs = require('fs');
const path = require('path');
const https = require('https');

// Parse command-line arguments
const [command, repoUrl, branch = 'main'] = process.argv.slice(2);

if (!command) {
	console.error('Usage: node src/git.js <command> [args]');
	process.exit(1);
}

// Extract repoOwner and repoName from the repoUrl
const repoMatch = repoUrl.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
if (!repoMatch) {
	console.error('Invalid repository URL');
	process.exit(1);
}
const repoOwner = repoMatch[1];
const repoName = repoMatch[2];

const baseUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;

function fetchRepoContents(url) {
	return new Promise((resolve, reject) => {
		https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
			let data = '';
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				resolve(JSON.parse(data));
			});
		}).on('error', (err) => {
			reject(err);
		});
	});
}

async function downloadFile(url, filePath) {
	return new Promise((resolve, reject) => {
		https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
			const fileStream = fs.createWriteStream(filePath);
			res.pipe(fileStream);
			fileStream.on('finish', () => {
				fileStream.close();
				resolve();
			});
		}).on('error', (err) => {
			fs.unlink(filePath, () => {}); // Delete the file async. (avoid using callback)
			reject(err);
		});
	});
}

async function processContents(contents, basePath) {
	for (const item of contents) {
		const fullPath = path.join(basePath, item.name);
		if (item.type === 'dir') {
			fs.mkdirSync(fullPath, { recursive: true });
			console.log(`Created directory: ${fullPath}`);
			const dirContents = await fetchRepoContents(item.url);
			await processContents(dirContents, fullPath);
		} else if (item.type === 'file') {
			try {
				// Ensure the directory exists before downloading the file
				const dirPath = path.dirname(fullPath);
				if (!fs.existsSync(dirPath)) {
					fs.mkdirSync(dirPath, { recursive: true });
					console.log(`Created directory: ${dirPath}`);
				}
				await downloadFile(item.download_url, fullPath);
				console.log(`Downloaded file: ${fullPath}`);
			} catch (err) {
				console.error(`Error downloading file ${fullPath}:`, err);
			}
		} else {
			console.warn(`Unknown type for ${fullPath}: ${item.type}`);
		}
	}
}

async function clone(repoUrl, branch) {
	try {
		const contents = await fetchRepoContents(`${baseUrl}?ref=${branch}`);
		await processContents(contents, repoName);
		console.log('Repository cloned successfully');
	} catch (err) {
		console.error('Error cloning repository:', err);
	}
}

function commit(message) {
	console.log(`Committed: ${message}`);
	// Here you would add logic to track changes and create a commit
}

function push(remoteUrl) {
	console.log(`Pushing changes to ${remoteUrl}`);
	// Here you would add logic to send changes to the remote
}

function pull(remoteUrl) {
	console.log(`Pulling changes from ${remoteUrl}`);
	// Here you would add logic to fetch and merge changes from the remote
}

function getVersion() {
	const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
	if (fs.existsSync(changelogPath)) {
		const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
		const versionMatch = changelogContent.match(/v(\d+\.\d+\.\d+)/);
		if (versionMatch) {
			return versionMatch[0];
		}
	}
	return 'Unknown version';
}

switch (command) {
	case 'clone':
		clone(repoUrl, branch);
		break;
	case 'commit':
		if (!process.argv[3]) {
			console.error('Usage: node src/git.js commit <message>');
			process.exit(1);
		}
		commit(process.argv[3]);
		break;
	case 'push':
		if (!process.argv[3]) {
			console.error('Usage: node src/git.js push <remoteUrl>');
			process.exit(1);
		}
		push(process.argv[3]);
		break;
	case 'pull':
		if (!process.argv[3]) {
			console.error('Usage: node src/git.js pull <remoteUrl>');
			process.exit(1);
		}
		pull(process.argv[3]);
		break;
	case '--version':
		console.log(getVersion());
		break;
	default:
		console.error(`Unknown command: ${command}`);
		process.exit(1);
}
