package main
import (
  "net/http"
)
func ping(w http.ResponseWriter, r *http.Request) {
  w.Write([]byte("pongFinFin3"))
}
func main() {
  http.Handle("/", http.FileServer(http.Dir("./static")))
  http.HandleFunc("/ping", ping)
  if err := http.ListenAndServe(":80", nil); err != nil {
    panic(err)
  }
}