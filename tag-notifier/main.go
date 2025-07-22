package main

import (
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type RSS struct {
	Channel Channel `xml:"channel"`
}

type Channel struct {
	Title string `xml:"title"`
	Items []Item `xml:"item"`
}

type Item struct {
	Title      string   `xml:"title"`
	Categories []string `xml:"category"`
}

func main() {

	root_url := "https://moringmark.grzegorzkoperwas.site"
	file := "feed.xml"

	url := root_url + "/" + file

	resp, err := http.Get(url)

	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Println("Got", resp.Status)
		os.Exit(1)
	}

	body, err := io.ReadAll(resp.Body)

	defer resp.Body.Close()

	if err != nil {
		panic(err)
	}

	var rss RSS
	err = xml.Unmarshal(body, &rss)
	if err != nil {
		panic(err)
	}

	var untaggedSeries []string

	for _, item := range rss.Channel.Items {
		if len(item.Categories) > 0 {
			continue
		}
		untaggedSeries = append(untaggedSeries, item.Title)
	}

	if len(untaggedSeries) == 0 {
		return
	}

	seriesList := strings.Join(untaggedSeries, ", ")

	message := fmt.Sprintf("%d comics untagged: %s", len(untaggedSeries), seriesList)

	fmt.Println(message)
}
