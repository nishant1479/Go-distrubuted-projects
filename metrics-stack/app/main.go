package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total HTTP requests processed, labeled by method, path, and status.",
		},
		[]string{"method", "path", "status"},
	)

	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Histogram of request latency in seconds.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path", "status"},
	)
)

type statusRecorder struct {
	http.ResponseWriter
	code int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.code = code
	r.ResponseWriter.WriteHeader(code)
}

func instrument(path string, h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, code: 200}
		h(rec, r)
		status := strconv.Itoa(rec.code)
		elapsed := time.Since(start).Seconds()

		httpRequestsTotal.WithLabelValues(r.Method, path, status).Inc()
		httpRequestDuration.WithLabelValues(r.Method, path, status).Observe(elapsed)
	}
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	// Simulate variable latency 50–250ms
	time.Sleep(time.Duration(50+rand.Intn(200)) * time.Millisecond)

	// Simulate ~10% errors for visibility
	if rand.Intn(10) == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(w, "error")
		return
	}

	fmt.Fprintln(w, "ok")
}

func workHandler(w http.ResponseWriter, r *http.Request) {
	msStr := r.URL.Query().Get("ms")
	ms, _ := strconv.Atoi(msStr)
	if ms < 0 {
		ms = 0
	}
	if ms > 5000 {
		ms = 5000
	}
	time.Sleep(time.Duration(ms) * time.Millisecond)
	fmt.Fprintf(w, "worked %dms\n", ms)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpRequestDuration)

	http.Handle("/metrics", promhttp.Handler())
	http.HandleFunc("/hello", instrument("/hello", helloHandler))
	http.HandleFunc("/work", instrument("/work", workHandler))

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
