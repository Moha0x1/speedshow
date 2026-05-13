use axum::{
    extract::Request,
    routing::{get, post},
    Router,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::net::SocketAddr;
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use futures_util::stream::StreamExt;
use tracing::info;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    // Configurar CORS para aceptar peticiones del frontend
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(health_check))
        .route("/upload", post(handle_upload))
        .layer(cors);

    // Obtener el puerto de la variable de entorno PORT, o usar 8080 por defecto
    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "Rust Upload Node is active"
}

// Handler que lee los chunks a medida que llegan y los descarta (0 uso de memoria)
async fn handle_upload(mut request: Request) -> impl IntoResponse {
    let start_time = Instant::now();
    let mut total_bytes: usize = 0;

    let body = request.into_body();
    let mut stream = body.into_data_stream();

    // Consumir el stream chunk a chunk
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                total_bytes += bytes.len();
            }
            Err(_) => break, // Si hay error en el stream (ej. conexión cortada)
        }
    }

    let elapsed = start_time.elapsed();
    let elapsed_ms = elapsed.as_millis() as u64;

    let mbps = if elapsed_ms > 0 && total_bytes > 0 {
        let elapsed_sec = elapsed_ms as f64 / 1000.0;
        let bits = (total_bytes as f64) * 8.0;
        (bits / elapsed_sec) / 1_000_000.0
    } else {
        0.0
    };

    // Responder con el mismo formato que esperaba Next.js
    Json(json!({
        "bytes": total_bytes,
        "elapsedMs": elapsed_ms,
        "mbps": mbps
    }))
}
