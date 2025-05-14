import React from "react";

const ImageCarousel = () => {
  return (
    <section className="row">
      <div className="col-md-1"></div>
      <div className="col-md-10">
        <div className="carousel slide" id="mycarousel" data-bs-ride="carousel" data-bs-interval="10000">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/assets/images/carousel-1.png" alt="" className="d-block w-100" height="800px" />
            </div>
            <div className="carousel-item">
              <img src="/assets/images/carousel-2.png" alt="" className="d-block w-100" height="800px" />
            </div>
            <div className="carousel-item">
              <img src="/assets/images/carousel-3.png" alt="" className="d-block w-100" height="800px" />
            </div>
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#mycarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>

          <button className="carousel-control-next" type="button" data-bs-target="#mycarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      <div className="col-md-1"></div>
    </section>
  );
};

export default ImageCarousel;
