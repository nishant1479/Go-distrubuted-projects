package main

import (
	"context"
	"log"
	"os"
	"strings"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func main()  {
	
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err,"failed to connect to RabbitMQ")

	defer conn.Close()

	ch,err :=conn.Channel()
	failOnError(err,"failed to open a channel")
	defer ch.Close()

	q,err :=ch.QueueDeclare(
		"task_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	failOnError(err,"failed to declare a queue")
	
	ctx,cancel := context.WithTimeout(context.Background(),5*time.Second)

	defer cancel()

	body := bodyFrom(os.Args)

	err = ch.PublishWithContext(
		ctx,
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "Text/plain",
			Body: []byte(body),
		},
	)
	failOnError(err, "failed to publish a message")
	log.Printf(" [x] Sent %s\n",body)
}

func failOnError(err error, msg string){
	if err != nil {
		log.Fatalf("%s: %s",msg,err)
	}
}

func bodyFrom(args []string) string {
    var s string
    if (len(args) < 2) || os.Args[1] == "" {
        s = "hello"
    } else {
        s = strings.Join(args[1:], " ")
    }
    return s
}