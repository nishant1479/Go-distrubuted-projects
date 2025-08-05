package main

import (
	"fmt"
	"net/http"
	"html"
)

func main(){
	http.HandleFunc("/",func(w http.ResponseWriter, r *http.Request){
		fmt.Fprintf(w,"hello,%q",html.EscapeString(r.URL.Path))
	})

	http.HandleFunc("/hi",func(w http.ResponseWriter,r *http.Request){
		fmt.Fprintf(w,"hi")
	})

	http.ListenAndServe(":8081",nil)

}
// docker run -p 8080:8081 -it Docker
// docker build -t go-app .
// docker run go-app
