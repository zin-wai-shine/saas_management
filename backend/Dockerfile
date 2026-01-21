FROM golang:1.23-alpine AS builder

WORKDIR /app

ENV GOTOOLCHAIN=auto

COPY go.mod go.sum ./
RUN go mod download && go version

COPY . .
RUN GOTOOLCHAIN=auto go build -o main .

FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy the binary
COPY --from=builder /app/main .
# Copy migrations folder
COPY --from=builder /app/migrations ./migrations
# Copy uploads folder
COPY --from=builder /app/uploads ./uploads

EXPOSE 8080

CMD ["./main"]

