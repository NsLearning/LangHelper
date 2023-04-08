use serde::{Deserialize, Serialize};
use reqwest::{Client, Method, RequestBuilder,Proxy};
// use wry::http::UriScheme;

#[derive(Default, Serialize, Deserialize,Debug)]
pub struct Message {
    message: String,
    data:String,
}

#[tauri::command]
pub async fn fetch_data(
    method: String,
    url: String,
    body: Option<String>
) -> Result<Message, String>{
    println!("{},{},{:?}",method,url,body);

    let req_builder: RequestBuilder;
    let method = match method.as_str() {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "DELETE" => Method::DELETE,
        _ => {
            // Handle invalid method
            return Err("Invalid method".to_string());
        }
    };
    if url.contains("localhost"){
        let mut client_builder = Client::builder();
        // let mut client_builder = Client::builder()
        //         .pool_max_idle_per_host(15);
        //         .pool_idle_timeout(Duration::from_secs(10))
                // .build()?;
        client_builder = client_builder.proxy(Proxy::custom(move |url| {       
                None::<String> // bypass proxy for localhost
        }));
        let client = client_builder.build().map_err(|e| format!("Failed to create client: {}", e))?;
        req_builder = client.request(method, &url);
    } else {
        let client =Client::new();
        req_builder = client.request(method, &url);
    }
    
    let req_builder = req_builder.header("Content-Type", "application/json"); // Add header
    let resp = match body {
        Some(data) => req_builder.body(data).send().await.map_err(|e| format!("Request failed: {}", e))?,
        None => req_builder.send().await.map_err(|e| format!("Request failed: {}", e))?,
    };
    
    let message: Message = resp.json().await.map_err(|e| format!("Failed to parse response: {}", e))?;
    println!("response:{:?}",message);
    Ok(message) // Return the response directly
}
