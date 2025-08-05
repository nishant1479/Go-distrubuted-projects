FROM golang:1.12-alpine3.9

WORKDIR /app

COPY . .

RUN go build -o main .

CMD ["/app/main"]
