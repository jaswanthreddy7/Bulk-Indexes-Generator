Bulk Index Creator - Summary

This internal tool allows Splunk admins to generate bulk index configuration files quickly. 
Users can upload a list of indexes in .csv, .xlsx, or indexes.conf format. The tool parses the input, 
applies optional default values entered in the form, and generates a JSON file ready to use with Splunk ACS API.

Example Use Case:
If a user needs to create 1,000 indexes manually, it would typically take about 2 minutes per index. 
That results in roughly 33 hours of manual work. With this tool, the same can be done in under a minute, 
saving over 32 hours of effort while reducing the chances of human error.

Supported formats: .csv, .xlsx, .conf
Output: JSON
Purpose: Internal productivity tool to support bulk index onboarding in Splunk Cloud.






Prepared by Jaswanth Reddy Nagu
