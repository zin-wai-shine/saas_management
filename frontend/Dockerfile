FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Expose port
EXPOSE 5173

# Create entrypoint script that ensures dependencies are installed
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'npm install' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Start development server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

