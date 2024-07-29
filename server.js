const http = require('http');

const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    try {
      // Get the token
      const tokenResponse = await fetchToken();
      const token = tokenResponse.trim();

      // Fetch the private IP
      const privateIP = await fetchPrivateIP(token);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Private IP: ${privateIP}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Internal Server Error');
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

const fetchToken = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '169.254.169.254',
      port: 80,
      path: '/latest/api/token',
      method: 'PUT',
      headers: {
        'X-aws-ec2-metadata-token-ttl-seconds': '21600',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

const fetchPrivateIP = (token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '169.254.169.254',
      port: 80,
      path: '/latest/meta-data/local-ipv4',
      method: 'GET',
      headers: {
        'X-aws-ec2-metadata-token': token,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
