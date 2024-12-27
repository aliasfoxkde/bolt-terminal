const fs = require('fs');
const path = require('path');
const https = require('https');

// Parse command-line arguments
// Usage: node git-clone.js <repoOwner> <repoName> <branch>
const [repoOwner, repoName, branch] = process.argv.slice(2);

if (!repoOwner || !repoName || !branch) {
	console.error('Usage: node git-clone.js <repoOwner> <repoName> <branch>');
	process.exit(1);
}

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

async function main() {
	try {
		const contents = await fetchRepoContents(`${baseUrl}?ref=${branch}`);
		await processContents(contents, repoName);
		console.log('Repository cloned successfully');
	} catch (err) {
		console.error('Error cloning repository:', err);
	}
}

main();