document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        searchMovies(query);
    } else {
        alert('Please enter a movie title.');
    }
});



document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '97910366'; // Replace with your OMDb API key
    const searchForm = document.getElementById('search-form');
    const ratingButton = document.getElementById('submit-rating');
    const searchInput = document.getElementById('search-input');
    const viewRatedMoviesButton = document.getElementById('view-rated-movies');
    const submitRatingButton = document.getElementById('submit-rating');
    const movieList = document.getElementById('movie-list');
    const movieDetails = document.getElementById('movie-details');
    const ratedMoviesSection = document.getElementById('rated-movies');
    const container = document.querySelector('.container');
    const sortDropdown = document.getElementById('sort-movies');


    const sortSelect = document.getElementById('sort-movies');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                const sortBy = this.value;
                sortMovies(sortBy);
            });
        }

    function resetSite() {
            searchInput.value = ''; // Clear the search input
            movieList.innerHTML = ''; // Clear the search results list
            movieDetails.style.display = 'none'; // Hide the movie details section
            container.style.backgroundColor = ''; // Reset background color
            container.querySelectorAll('.detail-box').forEach(box => box.style.backgroundColor = ''); // Reset container color
            document.body.style.setProperty('--bg-image', 'none');
            document.body.classList.remove('show-bg');
            resetMovieDetails();

            const button = document.querySelector('button');
            const button2 = document.getElementById('view-rated-movies');

                button.style.backgroundColor = '#007BFF'; // Reset to the original color
                button2.style.backgroundColor = '#007BFF'; // Reset to the original color

                button.addEventListener('mouseover', () => {
                    button.style.backgroundColor = adjust('#007BFF', -50); // Change to your desired color
                });

                button2.addEventListener('mouseover', () => {
                    button2.style.backgroundColor = adjust('#007BFF', -50); // Change to your desired color
                });

                button.addEventListener('mouseout', () => {
                    button.style.backgroundColor = '#007BFF'; // Reset to the original color
                });

                button2.addEventListener('mouseout', () => {
                    button2.style.backgroundColor = '#007BFF'; // Reset to the original color
                });
        }


    searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Hide rated movies section
            ratedMoviesSection.style.display = 'none';

        });
    // Handle rating submission
    if (ratingButton) {
        ratingButton.addEventListener('click', async function() {
            const selectedRating = document.querySelector('input[name="rating"]:checked');
            const movieDetails = document.querySelector('#movie-details');
            const imdbID = movieDetails.getAttribute('data-id');

            if (imdbID) {
                if (selectedRating) {
                    const rating = selectedRating.value;

                    // Fetch movie details from OMDb API
                    try {
                        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
                        const movieData = await response.json();

                        if (movieData.Response === 'True') {
                            const ratedMovie = {
                                title: movieData.Title,
                                poster: movieData.Poster,
                                rating: rating
                            };

                            // Save the rating along with movie details to localStorage
                            localStorage.setItem(imdbID, JSON.stringify(ratedMovie));
                            document.getElementById('rating-response').innerText = `Thank you for rating "${movieData.Title}" ${rating}/5!`;
                        } else {
                            document.getElementById('rating-response').innerText = 'Movie not found.';
                        }
                    } catch (error) {
                        document.getElementById('rating-response').innerText = 'Error fetching movie details.';
                    }
                } else {
                    document.getElementById('rating-response').innerText = 'Please select a rating.';
                }
            } else {
                document.getElementById('rating-response').innerText = 'No movie selected.';
            }
        });
    }

    // Function to create a promise that resolves when an image is loaded
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Handle cross-origin issues
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    if (viewRatedMoviesButton) {
        viewRatedMoviesButton.addEventListener('click', async function() {
            resetSite();
            ratedMoviesSection.style.display = 'block';
            const ratedMovies = [];

            // Retrieve all movies from localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const movieData = localStorage.getItem(key);
                if (movieData) {
                    const movie = JSON.parse(movieData);
                    ratedMovies.push({ imdbID: key, ...movie });
                }
            }

            // Fetch movie details from OMDb API for each rated movie
            try {
                const movieDetailsPromises = ratedMovies.map(async movie => {
                    const response = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`);
                    return response.json();
                });

                const movieDetails = await Promise.all(movieDetailsPromises);

                // Merge movie details with ratings
                const moviesWithDetails = ratedMovies.map(movie => {
                    const details = movieDetails.find(detail => detail.imdbID === movie.imdbID);
                    return {
                        ...movie,
                        ...details,
                        rating: parseFloat(movie.rating) || 0 // Convert rating to number
                    };
                });

                // Sort movies based on the selected sort option
                const sortOption = sortDropdown.value;
                if (sortOption === 'rating') {
                    moviesWithDetails.sort((a, b) => b.rating - a.rating); // Sort by rating descending
                } else {
                    moviesWithDetails.sort((a, b) => a.Title.localeCompare(b.Title)); // Sort by name alphabetically
                }

                // Display rated movies
                const ratedMovieContainer = document.getElementById('rated-movie-container');
                if (!ratedMovieContainer) {
                    console.error('Element with ID "rated-movie-container" not found');
                    return;
                }
                ratedMovieContainer.innerHTML = '';
                for (const movie of moviesWithDetails) {
                    const movieDiv = document.createElement('div');
                    movieDiv.className = 'rated-movie';
                    movieDiv.style.backgroundImage = `url(${movie.Poster})`; // Apply background image

                    // Load the image and get the color
                    try {
                        const img = await loadImage(movie.Poster);
                        const colorThief = new ColorThief();
                        const dominantColor = rgbToHex(...colorThief.getColor(img));
                        const textColor = getTextColor(dominantColor);

                        movieDiv.innerHTML = `
                            <div class="content">
                                <img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster" data-id="${movie.imdbID}">
                                <div class="text-container" style="color: ${textColor};">
                                    <strong>${movie.Title}</strong>
                                    <p>Rating: ${JSON.parse(localStorage.getItem(movie.imdbID)).rating}/5</p>
                                </div>
                            </div>
                        `;
                        ratedMovieContainer.appendChild(movieDiv);
                    } catch (error) {
                        console.error('Error loading image or getting color:', error);
                    }
                }

                // Add click event listener to each movie poster
                document.querySelectorAll('.movie-poster').forEach(poster => {
                    poster.addEventListener('click', function() {
                        const imdbID = this.getAttribute('data-id');
                        showMovieDetails(imdbID);
                    });
                });

                ratedMoviesSection.style.display = moviesWithDetails.length > 0 ? 'block' : 'none';
            } catch (error) {
                console.error('Error fetching movie details:', error);
                const ratedMovieContainer = document.getElementById('rated-movie-container');
                if (ratedMovieContainer) {
                    ratedMovieContainer.innerHTML = '<p>Error fetching movie details.</p>';
                }
                ratedMoviesSection.style.display = 'none';
            }
        });
    }








    // Define the function to show movie details
    function showMovieDetails(imdbID) {
        // Fetch and display movie details based on the imdbID
        window.scrollTo(0,0);
        fetchMovieDetails(imdbID); // Replace with your existing function to fetch and display movie details
        ratedMoviesSection.style.display = 'none';
    }

function sortMovies(criteria) {
    const movieList = document.getElementById('rated-movie-container');
    if (!movieList) return;

    // Get current list items
    let movies = Array.from(movieList.querySelectorAll('.rated-movie'));

    // Sort based on the criteria
    movies.sort((a, b) => {
        const imdbID_A = a.querySelector('img').getAttribute('data-id');
        const imdbID_B = b.querySelector('img').getAttribute('data-id');

        if (criteria === 'name') {
            const titleA = a.querySelector('.text-container strong').innerText;
            const titleB = b.querySelector('.text-container strong').innerText;
            return titleA.localeCompare(titleB);
        } else if (criteria === 'rating') {
            const ratingA = JSON.parse(localStorage.getItem(imdbID_A)).rating;
            const ratingB = JSON.parse(localStorage.getItem(imdbID_B)).rating;
            console.log(ratingA);
            console.log(ratingB);
            return ratingB - ratingA; // Sort descending by rating
        }
        return 0;
    });

    // Update movie list with sorted items
    movieList.innerHTML = '';
    movies.forEach(movie => movieList.appendChild(movie));
}




});



function searchMovies(query) {


    const apiKey = '97910366'; // Replace with your OMDb API key
    const url = `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`;

    // Reset movie details and show search results
    document.getElementById('movie-details').style.display = 'none';
    document.getElementById('movie-list').style.display = 'flex';
    document.body.classList.remove('show-bg'); // Remove background blur
    document.querySelector('.container').style.backgroundColor = 'rgb(255,255,255)';

    const button = document.querySelector('button');
    const button2 = document.getElementById('view-rated-movies');
    button.style.backgroundColor = '#007BFF'; // Reset to the original color

    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = adjust('#007BFF', -50); // Change to your desired color
    });

    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#007BFF'; // Reset to the original color
    });


    button2.addEventListener('mouseover', () => {
        button2.style.backgroundColor = adjust('#007BFF', -50); // Change to your desired color
    });

    button2.addEventListener('mouseout', () => {
        button2.style.backgroundColor = '#007BFF'; // Reset to the original color
    });

    document.querySelector('h1').style.color = 'black';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'False') {
                document.getElementById('movie-list').innerHTML = `<p>${data.Error}</p>`;
            } else {
                const movies = data.Search;
                if (movies) {
                    let output = '';
                    movies.forEach(movie => {
                        output += `
                            <li data-id="${movie.imdbID}">
                                <img src="${movie.Poster}" alt="${movie.Title} Poster">
                            </li>
                        `;
                    });
                    document.getElementById('movie-list').innerHTML = output;

                    // Remove existing event listeners
                    document.querySelectorAll('#movie-list li').forEach(item => {
                        item.removeEventListener('click', handleMovieClick);
                    });

                    // Add new click event listener to movie items
                    document.querySelectorAll('#movie-list li').forEach(item => {
                        item.addEventListener('click', handleMovieClick);
                    });
                } else {
                    document.getElementById('movie-list').innerHTML = '<p>No movies found.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('movie-list').innerHTML = '<p>Failed to fetch movies.</p>';
        });
}

function handleMovieClick() {
    window.scrollTo(0,0);
    const imdbID = this.getAttribute('data-id');
    fetchMovieDetails(imdbID);
}

function fetchMovieTitle(imdbID) {
    const apiKey = '97910366'; // Replace with your OMDb API key
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'False') {
                document.getElementById('movie-details').innerHTML = `<p>${data.Error}</p>`;
                document.getElementById('movie-details').style.display = 'none';
                document.getElementById('movie-list').style.display = 'flex'; // Show the list again
                resetMovieDetails(); // Reset details before showing new data
                document.body.classList.remove('show-bg'); // Remove background blur
                return null; // Return null if there's an error
            } else {
                return data.Title;

            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            return null; // Return null in case of an error
        });
}


// Function to reset the rating stars
function resetRatingStars() {
    const ratingButtons = document.querySelectorAll('input[name="rating"]');
    ratingButtons.forEach(button => {
        button.checked = false;
    });
}

// Modify the function that shows movie details to reset stars
function showMovieDetails(imdbID) {
    window.scrollTo(0,0);
    resetRatingStars(); // Reset stars before showing new movie
    fetchMovieDetails(imdbID); // Fetch and display movie details
    ratedMoviesSection.style.display = 'none';
}


function setRatingFromLocalStorage(imdbID) {
    const rating = localStorage.getItem(imdbID);

    if (rating) {
        const parsedRating = JSON.parse(rating).rating; // Parse and get the rating
        const radioInput = document.querySelector(`input[name="rating"][value="${parsedRating}"]`);

        if (radioInput) {
            radioInput.checked = true; // Set the appropriate radio button as checked
        }
    }
}

// Function to fetch and display movie details
function fetchMovieDetails(imdbID) {
    const apiKey = '97910366'; // Replace with your OMDb API key
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'False') {
                document.getElementById('movie-details').innerHTML = `<p>${data.Error}</p>`;
                document.getElementById('movie-details').style.display = 'none';
                document.getElementById('movie-list').style.display = 'flex';
                resetMovieDetails();
                document.body.classList.remove('show-bg');
            } else {
                resetMovieDetails();
                resetRatingStars(); // Reset stars when fetching new details


                const movieDetailsElement = document.getElementById('movie-details');
                movieDetailsElement.setAttribute('data-id', imdbID);

                // Populate movie details
                                document.getElementById('movie-title').innerText = data.Title;
                                document.getElementById('movie-year').innerText = data.Year;
                                document.getElementById('movie-rated').innerText = data.Rated;
                                document.getElementById('movie-runtime').innerText = data.Runtime;
                                document.getElementById('movie-genre').innerText = data.Genre;
                                document.getElementById('movie-director').innerText = `Directed by: ${data.Director}`;
                                document.getElementById('movie-writer').innerText = `Written by: ${data.Writer}`;
                                document.getElementById('movie-actors').innerText = `Actors: ${data.Actors}`;
                                document.getElementById('movie-plot').innerText = data.Plot;
                                document.getElementById('movie-language').innerText = data.Language;
                                document.getElementById('movie-country').innerText = data.Country;
                                document.getElementById('movie-awards').innerText = `Awards: ${data.Awards}`;
                                document.getElementById('movie-boxoffice').innerText = `Grossed ${data.BoxOffice}`;
                                document.getElementById('movie-poster').src = data.Poster;

                                document.body.style.setProperty('--bg-image', `url(${data.Poster})`);
                                document.body.classList.add('show-bg');
                                setRatingFromLocalStorage(imdbID);

                                // Wait for the image to load before using Color Thief
                                const img = new Image();
                                img.crossOrigin = 'Anonymous';
                                img.src = data.Poster;
                img.onload = function() {
                                    const colorThief = new ColorThief();
                                    const dominantColor = colorThief.getColor(img);
                                    const colorHex = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);

                                    // Apply the extracted colors
                                    document.querySelector('.container').style.backgroundColor = rgbToRgba("rgb("+dominantColor[0]+"," +dominantColor[1]+","+ dominantColor[2]+")",0.7);
                                    document.querySelectorAll('#movie-details .detail-box').forEach(box => {
                                        box.style.backgroundColor = colorHex;
                                    });
                                    document.querySelectorAll('#movie-details p').forEach(p => {
                                        p.style.color = getTextColor(colorHex);
                                    });

                                    const button = document.querySelector('button');
                                    const button2 = document.getElementById('view-rated-movies');

                                    button.style.backgroundColor = adjust(colorHex, -30); // Reset to the original color
                                    button2.style.backgroundColor = adjust(colorHex, -30); // Reset to the original color

                                    button.addEventListener('mouseover', () => {
                                        button.style.backgroundColor = adjust(colorHex, -50); // Change to your desired color
                                    });

                                    button2.addEventListener('mouseover', () => {
                                        button2.style.backgroundColor = adjust(colorHex, -50); // Change to your desired color
                                    });

                                    button.addEventListener('mouseout', () => {
                                        button.style.backgroundColor = adjust(colorHex, -30); // Reset to the original color
                                    });

                                    button2.addEventListener('mouseout', () => {
                                        button2.style.backgroundColor = adjust(colorHex, -30); // Reset to the original color
                                    });
                                    // Set color for h1 and specific text elements
                                    document.querySelector('h1').style.color = getTextColor(colorHex);
                                    document.getElementById('movie-title').style.color = getTextColor(colorHex);
                                    document.getElementById('movie-rating').querySelector('label').style.color = getTextColor(colorHex);
                                };

                                document.getElementById('movie-details').style.display = 'block';
                                document.getElementById('movie-list').style.display = 'none';
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching movie details:', error);
                        });
}


// Utility function to convert RGB to Hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Utility function to get a contrasting text color
function getTextColor(bgColor) {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Utility function to adjust color brightness
function adjust(colorHex, amount) {
    let r = parseInt(colorHex.slice(1, 3), 16);
    let g = parseInt(colorHex.slice(3, 5), 16);
    let b = parseInt(colorHex.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));

    return rgbToHex(r, g, b);
}

// Reset movie details and styles
function resetMovieDetails() {
    const elements = [
        'movie-title', 'movie-year', 'movie-rated', 'movie-runtime', 'movie-genre',
        'movie-director', 'movie-writer', 'movie-actors', 'movie-plot', 'movie-language',
        'movie-country', 'movie-awards', 'movie-boxoffice', 'movie-poster', 'rating-response'
    ];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'movie-poster') {
                element.src = '';
            } else {
                element.innerText = '';
            }
        }
    });

    // Reset background
    document.body.style.setProperty('--bg-image', 'none');
    document.body.classList.remove('show-bg');

    // Reset container background color
    const container = document.querySelector('.container');
    if (container) {
        container.style.backgroundColor = 'rgb(255,255,255)';
    }

    // Reset colors for detail boxes and text
    const detailBoxes = document.querySelectorAll('#movie-details .detail-box');
    detailBoxes.forEach(box => {
        box.style.backgroundColor = '';
    });

    const paragraphs = document.querySelectorAll('#movie-details p');
    paragraphs.forEach(p => {
        p.style.color = '';
    });

    const h1 = document.querySelector('h1');
    if (h1) {
        h1.style.color = '';
    }

    const movieTitle = document.getElementById('movie-title');
    if (movieTitle) {
        movieTitle.style.color = '';
    }

    const movieRatingLabel = document.getElementById('movie-rating')?.querySelector('label');
    if (movieRatingLabel) {
        movieRatingLabel.style.color = '';
    }
}


function rgbToRgba(rgb, alpha) {
    // Check if rgb is a string and contains 'rgb('
    if (typeof rgb === 'string' && rgb.startsWith('rgb(')) {
        // Remove 'rgb(' and ')' from the string and split the values
        const rgbValues = rgb.replace(/^rgb\(|\)$/g, '').split(',').map(Number);
        return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${alpha})`;
    } else if (typeof rgb === 'object' && rgb.r !== undefined && rgb.g !== undefined && rgb.b !== undefined) {
        // Handle rgb object format
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    } else {
        console.log(rgb);
        throw new TypeError('Invalid RGB format');
    }
}
