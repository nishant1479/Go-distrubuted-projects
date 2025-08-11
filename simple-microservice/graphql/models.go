package main

type Accpint struct{
	ID		string		`jsone:"id"`
	Name	string		`json:"name"`
	Orders []Order		`json:"orders"`
}