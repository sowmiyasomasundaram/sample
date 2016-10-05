'use strict';


var Book = angular.module('Book', [
    'ngRoute',
    'ESCategoryServices',
    'ngSanitize',
    'ui.bootstrap',
    'Filterservice',
    'Ratingservice'
]);

Book.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider.
        when('/home', {
            templateUrl: 'assets/partials/home.html',
            controller: 'HomeCtrl'
        }).
        when('/category/:categoryId', {
            templateUrl: 'assets/partials/category.html',
            controller: 'CategoryCtrl'
        }).
        when('/detail/:detailId', {
            templateUrl: 'assets/partials/detail.html',
            controller: 'DetailCtrl'
        }).
        otherwise({
            redirectTo: '/home'
        });
    }
]);

Book.controller('HomeCtrl', function($scope, BookInfo, filterFilter, HeaderData) {
    var cart = "0"
    $scope.wishlist = function() {
        var BookId = ".book" + this.BookDetails.BookId + " .favorite"
        $(BookId).toggleClass('addfavorite')
    }
    $scope.common = HeaderData.header
    $scope.shippingData = HeaderData.shipping
    $scope.BookDetails = BookInfo.BookDetails
    $scope.selectedBook = [];
    $scope.subtotal = "0"
    $scope.addcart1 = function() {
        var BookId = ".book" + this.BookDetails.BookId + " .cart-bton"
        if (!$(BookId).hasClass('added')) {
            cart++
        }
        $(BookId).addClass('added')
        $('.quantity').html(cart)
        $('.text-warning').html(cart + " ITEMS")
        if (cart > 2) {
            $('.list-product').addClass('scrool')
        }
		
        $scope.selectedBook.push($scope.BookDetails[this.BookDetails.BookId]);

        for (var i = 0; i < $scope.selectedBook.length; i++) {
            $scope.subtotal = $scope.subtotal + $scope.selectedBook[i].New_Price
        }
    }
    $scope.categorydataArray = [];
    $scope.search = {};
    $scope.resetFilters = function() {        
        $scope.search = {};        
    };
    $scope.currentPage = 1;
    $scope.totalItems = $scope.BookDetails.length;
    $scope.entryLimit = 8; // items per page
    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
    $scope.$watch('search', function(newVal, oldVal) {
        $scope.filtered = filterFilter($scope.BookDetails, newVal);
        $scope.totalItems = $scope.filtered.length;
        $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
        $scope.currentPage = 1;
    }, true);
});


Book.controller('DetailCtrl', function($scope, $routeParams, DetailServices, BookInfo, HeaderData, $timeout) {
    $scope.EBooks = {};
    var EBooks = $scope.EBooks;
    EBooks.Age_Group = true;
    $scope.detail = DetailServices.appdetail.query({
        detailId: $routeParams.detailId
    });
	
    $scope.reviews = [];
    this.rating1 = 1;
    this.rating2 = 2;
    this.isReadonly = true;
    this.rateFunction = function(rating) {
        console.log('Rating selected: ' + rating);
    };
    $scope.flag = false
    $scope.review = {};

    $scope.addReview = function() {
        $('#contact-form').validate({
            rules: {
                name: {
                    minlength: 2,
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                message: {
                    minlength: 2,
                    required: true
                }
            },
            highlight: function(element) {
                $(element).closest('.control-group').removeClass('success').addClass('error');
            },
            success: function(element) {
                element.text('').addClass('valid')
                    .closest('.control-group').removeClass('error').addClass('success');

            }

        });
        $timeout(function() {                        
            console.log($(".control-group").length)
            for (i = 0; i < $(".control-group").length; i++) {
                if ($(".control-group").hasClass('error')) {
                    $scope.flag = false
                } else {
                    $scope.flag = true
                }
            }
            console.log($scope.flag)
            if ($scope.flag == true) {
                $scope.review.star = $('.rate').html()
                $scope.reviews.push({
                    name: $scope.review.username,
                    email: $scope.review.email,
                    star: $scope.review.star,
                    message: $scope.review.message
                });
                $scope.review = {};
            }      
        }, 1000); 
    };

    $scope.selectedTab = 1;
    $scope.common = HeaderData.header
    $scope.shippingData = HeaderData.shipping

    for (var i = 0; i < BookInfo.BookDetails.length; i++) {
        if (BookInfo.BookDetails[i].Title == $routeParams.detailId) {
            $scope.Detail = BookInfo.BookDetails[i]
            if ($scope.Detail.Age_Group == "") {
                EBooks.Age_Group = false;
            }
            if ($scope.Detail.Age_Group == "") {
                EBooks.Age_Group = false;
            }
            if ($scope.Detail.Age_Group == "") {
                EBooks.Age_Group = false;
            }
        }
    }

    $scope.addcart = function() {
        $('.quantity').html("1");
        $('.text-warning').html("1 ITEMS");
        $scope.shoppingcart = $scope.Detail        
        $('.cart-bton').addClass('added');
    }

    $scope.wishlist = function() {
        $('.favorite').toggleClass('addfavorite')
    } 

});

var Ratingservice = angular.module('Ratingservice', []).directive('starRating', function() {
    return {
        restrict: 'EA',
        template: '<ul class="star-rating" ng-class="{readonly: readonly}">' +
            '  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +
            '    <i class="fa fa-star"></i>' + // or &#9733
            '  </li>' +
            '</ul>',
        scope: {
            ratingValue: '=ngModel',
            max: '=?', // optional (default is 5)
            onRatingSelect: '&?',
            readonly: '=?'
        },
        link: function(scope, element, attributes) {
            if (scope.max == undefined) {
                scope.max = 5;
            }

            function updateStars() {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.toggle = function(index) {
                if (scope.readonly == undefined || scope.readonly === false) {
                    scope.ratingValue = index + 1;
                    scope.onRatingSelect({
                        rating: index + 1
                    });
                }
            };
            scope.$watch('ratingValue', function(oldValue, newValue) {
                if (newValue) {
                    updateStars();

                    console.log(scope.ratingValue)
                }
            });
        }
    };
});


var Filterservice = angular.module('Filterservice', []).filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
            keys = [];
        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });
        return output;
    };
});


Book.filter('startFrom', function() {
    return function(input, start) {
        if (input) {
            start = +start;
            return input.slice(start);
        }
        return [];
    };
});


Book.service('HeaderData', function() {
    this.header = [{
            "Logo": "assets/images/WNC_Logo.png",
            "Sitename": "Wipro Book Store",
        }
    ];

    this.shipping = [{
            "Icon": "assets/images/icon-1.png",
            "Title": "FREE SHIPPING",
            "Subtxt": "on all over India"
        },

        {
            "Icon": "assets/images/icon-2.png",
            "Title": "MONEY BACK",
            "Subtxt": "30 days coveneance"
        },

        {
            "Icon": "assets/images/icon-3.png",
            "Title": "BEST SUPPORT",
            "Subtxt": "(91) 44-3929-0000"
        },
    ];
});


Book.service('BookInfo', function() {

    this.BookDetails = [{
            "BookId": "0",
            "Image": "assets/images/artificial-intelligence.jpeg",
            "Stock": "In-Stock",
            "Title": "Artificial Intelligence",
            "Old_Price": "829",
            "New_Price": "661",
            "Category": "Computers and Internet Books",
            "Short_description": "This edition captures the changes that have taken place in the field of artificial intelligence (AI) since the last edition in 2003. There have been important applications of AI technology, such as the widespread deployment of practical speech recognition, machine translation, autonomous vehicles, and household robotics.",
            "Long_description": "This edition captures the changes that have taken place in the field of artificial intelligence (AI) since the last edition in 2003. There have been important applications of AI technology, such as the widespread deployment of practical speech recognition, machine translation, autonomous vehicles, and household robotics. There have been algorithmic landmarks, such as the solution of the game of checkers. There has also been a great deal of theoretical progress, particularly in areas such as probabilistic reasoning, machine learning, and computer vision. Features • Nontechnical learning material provides a simple overview of major concepts • Expanded coverage of topics such as constraint satisfaction, local search planning methods, multi-agent systems, game theory, statistical natural language processing and uncertain reasoning over time • More detailed descriptions of algorithms for probabilistic inference, fast propositional inference, probabilistic learning approaches including EM, and other topics • Updated and expanded exercises • A unified, agent-based approach to AI : Organizes the material around the task of building intelligent agents	•  Comprehensive, up-to-date coverage : Includes a unified view of the field organized around the rational decision making paradigm • In-depth coverage of basic and advanced topics which provides students with a basic understanding of the frontiers of AI without compromising complexity and depth. • Pseudo-code versions of the major AI algorithms are presented in a uniform fashion, and Actual Common Lisp and Python implementations of the presented algorithms are available via the Internet",
            "Publication_Year": "2015",
            "Author": "Russell,Norvig",
            "Age_Group": "16+",
            "Language": "English"
        }, {
            "Image": "assets/images/computer-fundamentals.jpeg",
            "BookId": "1",
            "Stock": "Out of Stock",
            "Title": "Computer Fundamentals 6th Edition",
            "Old_Price": "297",
            "New_Price": "236",
            "Category": "Computers and Internet Books",
            "Short_description": "The Sixth edition of this widely popular book is designed to introduce its readers to important concepts in Computer Science. Computer Applications and Information Technology through a single book complete with numerous illustrative diagrams, practical examples, chapter summaries, end-of-chapter questions and glossary of important terms.",
            "Long_description": "The Sixth edition of this widely popular book is designed to introduce its readers to important concepts in Computer Science. Computer Applications and Information Technology through a single book complete with numerous illustrative diagrams, practical examples, chapter summaries, end-of-chapter questions and glossary of important terms. Computer Fundamentals is designed to serve as text book for various introductory courses in Computer Science, Computer Applications, Information Technology and other related areas. Book Covers major topics in the field, including Characteristics, Generations, Classification and Basic organization of Computers Number systems, Computer Codes, Binary arithmetic, Boolean algebra and Logic Circuits Internal structure and functioning of CPUs, Memory, Secondary storage devices and I/O devices Commuter Software, its various types with examples and commonly used tools and techniques for planning development, implementation and operation of software systems.	Computer languages, Computer networks, Operating systems and Database technologies The Internet, Multimedia computing systems and their applications and many more... Reader will find this edition more useful than previous editions because :- New topics and classifications are added to various chapters, introducing readers to newer frontiers in computing The layout has been improved considerably to make the contents attractive and easier to read Illustrative diagrams and overall layout are improved to make the contents attractive and lucid to read Lecture Notes CD contents is suitably updated 		Size of the book is made handy on feedback from readers.",
            "Publication_Year": "2003",
            "Author": "Pradeep Sinha, Priti Sinha",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/java.jpeg",
            "BookId": "2",
            "Stock": "In-Stock",
            "Title": "Java - The Complete Reference 7th Edition",
            "Old_Price": "695",
            "New_Price": "441",
            "Category": "Computers and Internet Books",
            "Short_description": "In this comprehensive resource, top-selling programming author Herbert Schildt shows you everything you need to develop, compile, debug, and run Java programs. This expert guide has been updated for Java Platform Standard Edition 6 (Java SE 6) and offers complete coverage of the Java language, its syntax, keywords, and fundamental programming principles.",
            "Long_description": "In this comprehensive resource, top-selling programming author Herbert Schildt shows you everything you need to develop, compile, debug, and run Java programs. This expert guide has been updated for Java Platform Standard Edition 6 (Java SE 6) and offers complete coverage of the Java language, its syntax, keywords, and fundamental programming principles. You'll also find information on Java's key API libraries, learn to create applets and servlets, and use JavaBeans. Herb has even included expanded coverage of Swing--the toolkit that defines the look and feel of the modern Java GUI. Essential for every Java programmer, this lasting resource features the clear, crisp, uncompromising style that has made Herb the choice of millions of programmers worldwide.",
            "Publication_Year": "2007",
            "Author": "Herbert Schildt",
            "Age_Group": "16+",
            "Language": "English"
        }, {
            "Image": "assets/images/cloud-computing.jpeg",
            "BookId": "3",
            "Stock": "In-Stock",
            "Title": "Cloud Computing : A Practitioner's Guide 1st Edition",
            "Old_Price": "495",
            "New_Price": "470",
            "Category": "Computers and Internet Books",
            "Short_description": "Cloud Computing: A Practitioner's Guide 1st Edition, authored by Aravind Doss and Rajeev Nanda, is a book that has been designed to help people understand cloud and provide technology practitioners with a simple framework to deliver a cloud-based solution for their enterprise.",
            "Long_description": "Cloud Computing: A Practitioner's Guide 1st Edition, authored by Aravind Doss and Rajeev Nanda, is a book that has been designed to help people understand cloud and provide technology practitioners with a simple framework to deliver a cloud-based solution for their enterprise. The book includes FAQs on Cloud Computing. About McGraw Hill Education: McGraw Hill Education is a provider of educational books. They have marketed books on education content like 1000 Plus Questions on Indian Polity: General Studies for Civil Services Preliminary Examination (Paper - 1) 1st Edition, UGC NET PAPER I 1st Edition, JEE Main 2013: Mathematics Crash Course 1st Edition, and JEE Main 2013: Chemistry Crash Course 1st Edition. McGraw Hill Education was founded in 1970. They have since been providers of books, in both printed and digital format, for the purpose of education and higher learning.",
            "Publication_Year": "2013",
            "Author": "Rajeev Nanda, Aravind Doss",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/software-engineering.jpeg",
            "BookId": "4",
            "Stock": "In-Stock",
            "Title": "Software Engineering 9th Edition",
            "Old_Price": "869",
            "New_Price": "695",
            "Category": "Computers and Internet Books",
            "Short_description": "The ninth edition of this best-selling introduction presents a broad perspective of software engineering, focusing on the processes and techniques fundamental to the creation of reliable, software systems.",
            "Long_description": "The ninth edition of this best-selling introduction presents a broad perspective of software engineering, focusing on the processes and techniques fundamental to the creation of reliable, software systems. Increased coverage of agile methods and software reuse, along with coverage of 'traditional' plan-driven software engineering, gives readers the most up-to-date view of the field currently available. Practical case studies, a full set of easy-to-access supplements and extensive web resources make teaching the course easier than ever.",
            "Publication_Year": "2013",
            "Author": "Ian Sommerville",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/computer-networks.jpeg",
            "BookId": "5",
            "Stock": "In-Stock",
            "Title": "Computer Networks 5th Edition",
            "Old_Price": "679",
            "New_Price": "465",
            "Category": "Computers and Internet Books",
            "Short_description": "Cloud Computing: Computer Networks 5th Edition is a book authored by Andrew S. Tanenbaum and David J. Wetherall. The book gives vast knowledge about the field of Computer Networking.",
            "Long_description": "Computer Networks 5th Edition is a book authored by Andrew S. Tanenbaum and David J. Wetherall. The book gives vast knowledge about the field of Computer Networking. About Andrew.S.Tanenbaum: Andrew.S.Tanenbaum is a professor of Computer Science by profession. He has written books like Computer Networks, co-authored with David J. Wetherall, Operating Systems: Design and Implementation, co-authored with Albert Woodhull, Modern Operating Systems, Distributed Operating Systems and Distributed Systems: Principles and Paradigms, co-authored with Maarten van Steen. About David J. Wetherall: David J. Wetherall is a professor by profession in the department of Computer Science and Engineering. He taught at the University of Washington. He has authored several books including: Computernetzwerke, Computer Networks, and Computer Networks (5th Edition) by Tanenbaum, Andrew S., Wetherall, David J. 5th (fifth) Edition [Hardcover(2010)].",
            "Publication_Year": "2014",
            "Author": "Andrew S. Tanenbaum, David J. Wetherall",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/digital-fundamentals.jpeg",
            "BookId": "6",
            "Stock": "In-Stock",
            "Title": "Digital Fundamentals 10th Edition",
            "Old_Price": "795",
            "New_Price": "400",
            "Category": "Computers and Internet Books",
            "Short_description": "Digital Fundamentals is a comprehensive book for undergraduate students of Electronics and Communications Engineering. The book comprises chapters on digital concepts, logic gates, combinational logical analysis, shift registers, data storage, and data processing.",
            "Long_description": "Digital Fundamentals is a comprehensive book for undergraduate students of Electronics and Communications Engineering. The book comprises chapters on digital concepts, logic gates, combinational logical analysis, shift registers, data storage, and data processing. In addition, the book consists of several illustrations, examples, exercises, and applications to understand the concepts better. This book is essential for engineers preparing for the Graduate Aptitude Test in Engineering. About Pearson: Pearson Education has been publishing books on all genres like science, technology, law, business, humanities and others, and has been educating more than a hundred million people across the world. Their books have not only been helping students in learning, but are also aiding teachers and professionals. Pearson Education India publishes academic books and reference books in various fields like business and management, computer science and other engineering domains, competitive exam guides among other types of books. Some of the books published by Pearson Education India are Decision Support and Business Intelligence systems, Electromagnetic Field Theory, Computer Architecture and Organization, Managing Business Process Flows and A Critical Companion to Compulsory English.",
            "Publication_Year": "2011",
            "Author": "Floyd",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/web-technologies.jpeg",
            "BookId": "7",
            "Stock": "In-Stock",
            "Title": "WEB TECHNOLOGIES",
            "Old_Price": "545",
            "New_Price": "515",
            "Category": "Computers and Internet Books",
            "Short_description": "Web Technologies is specially designed as a textbook for undergraduate students of Computer Science & Engineering and Information Technology and postgraduate students of Computer Applications.",
            "Long_description": "Web Technologies is specially designed as a textbook for undergraduate students of Computer Science & Engineering and Information Technology and postgraduate students of Computer Applications. The book seeks to provide a thorough understanding of fundamentals of Web Technologies.",
            "Publication_Year": "2010",
            "Author": "UTTAM K. ROY",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/operating-systems.jpeg",
            "BookId": "8",
            "Stock": "Cannot be purchased",
            "Title": "OPERATING SYSTEM 3rd Edition",
            "Old_Price": "535",
            "New_Price": "482",
            "Category": "Computers and Internet Books",
            "Short_description": "This book aims to demystify the subject using a simplified step-wise approach of going from the basic fundamentals concepts to advanced concepts. The approach, combined with the numerous illustrations and other pedagogical features of the book, makes it an invaluable resource for the students.",
            "Long_description": "This book aims to demystify the subject using a simplified step-wise approach of going from the basic fundamentals concepts to advanced concepts. The approach, combined with the numerous illustrations and other pedagogical features of the book, makes it an invaluable resource for the students. Salient Features: New chapters on File Systems and Information Management & Disk Scheduling Enhanced coverage on Computer Architecture, Operating Systems- Functions and Structure, Process Synchronization, Dead locks and Memory Management Good coverage of Parallel Processing, Security and Protection Over 470 questions including objective-type and test questions",
            "Publication_Year": "2010",
            "Author": "Achyut S Godbole",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/linux-kernel-development.jpeg",
            "BookId": "9",
            "Stock": "In-Stock",
            "Title": "Linux Kernel Development 3 Edition",
            "Old_Price": "619",
            "New_Price": "393",
            "Category": "Computers and Internet Books",
            "Short_description": "This new edition is packed with new and revised content, reflecting the many changes to new Linux versions, including coverage of alternative shells to the default bash shell.",
            "Long_description": "This new edition is packed with new and revised content, reflecting the many changes to new Linux versions, including coverage of alternative shells to the default bash shell. For this edition, the author has teamed up with another Linux expert with their shared expertise, they take you beyond the basics of shell scripting and guide you through using shell scripting for higher-level applications that are commonly found in Linux environments. In addition, this edition features a host of real-world examples, so you can see how the scripts work in application.",
            "Publication_Year": "2010",
            "Author": "Robert Love",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/data-structures.jpeg",
            "BookId": "10",
            "Stock": "In-Stock",
            "Title": "Data Structures Using C 1st Edition",
            "Old_Price": "315",
            "New_Price": "302",
            "Category": "Computers and Internet Books",
            "Short_description": "Data Structures Using C 1st Edition, authored by Reema Thareja, is a comprehensive book that is designed to serve as a textbook for students of the Maharashtra State Board of Technical Education (MSBTE). ",
            "Long_description": "Data Structures Using C 1st Edition, authored by Reema Thareja, is a comprehensive book that is designed to serve as a textbook for students of the Maharashtra State Board of Technical Education (MSBTE). It gives an introduction to data structures and presents linear data structures like stacks, queues and structures. The book comprises solved examples, illustrations, programs and algorithms. About Oxford University Press: Oxford University Press is a renowned publishing house that develops and publishes high quality textbooks, scholarly works, and academic books for school courses, bilingual dictionaries and also digital materials for both learning and teaching. It is a division of the University of Oxford. The first book was locally published in the year 1912. Some of the books published under their banner are India’s Ancient Past, Atkins’ Physical Chemistry, Companion to Politics in India, Sociology: Themes and Perspectives and Common Mistakes at IELTS Advanced…and How to Avoid Them.",
            "Publication_Year": "2013",
            "Author": "Reema Thareja",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/artificial-intelligence-3rd.jpeg",
            "BookId": "11",
            "Stock": "In-Stock",
            "Title": "Artificial Intelligence 3rd Edition",
            "Old_Price": "545",
            "New_Price": "515",
            "Category": "Computers and Internet Books",
            "Short_description": "Artificial Intelligence is a comprehensive book for undergraduate students of Computer Science Engineering. The book comprises chapters on heuristic search techniques, using predicate logic, symbolic reasoning under uncertainty, weak slot-and-filler structures, natural language processing, connectionist models and fuzzy logic systems.",
            "Long_description": "Artificial Intelligence is a comprehensive book for undergraduate students of Computer Science Engineering. The book comprises chapters on heuristic search techniques, using predicate logic, symbolic reasoning under uncertainty, weak slot-and-filler structures, natural language processing, connectionist models and fuzzy logic systems. In addition, the book consists of several examples and practice exercises to understand the complex concepts of artificial intelligence better. This book is essential for computer science engineers preparing for competitive exams like GATE and IES. About McGraw Hill Education: McGraw Hill Education is an Indian academic publishing company involved in releasing expertly authored books for students studying in India. McGraw Hill books present material which goes beyond traditional books and offer students an edge so that they can excel in their educational endeavors. The company has also released books like NTSE Practice Papers Class-X and Study Package for NTSE Class VIII.",
            "Publication_Year": "2012",
            "Author": "RICH",
            "Age_Group": "16+",
            "Language": "English"
        },

        {
            "Image": "assets/images/batman.jpeg",
            "BookId": "12",
            "Stock": "In-Stock",
            "Title": "Batman: Killing Joke",
            "Old_Price": "1099",
            "New_Price": "657",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "Joker is the man whom we all love to hate. His insanity is what makes you wonder whether it is contagious. In Batman : The Killing Joke, the Joker tries to manipulate and push people to the brim in hope that they’ll turn insane.",
            "Long_description": "Joker is the man whom we all love to hate. His insanity is what makes you wonder whether it is contagious. In Batman : The Killing Joke, the Joker tries to manipulate and push people to the brim in hope that they’ll turn insane. Summary of the Book: Joker’s insanity has human perseverance are revealed in The Batman : The Killing Joke. Joker believes that any human being when pushed beyond a certain point can go mad, which is what he tries to do with Commissioner Gordon. The joker kidnaps Gordon before which he shoots and paralyzes his daughter Barbara. Joker tries to attack the commissioner’s mind and drive him to the point of going insane. Gordon doesn’t fall for Joker’s plot and maintains his composure with the help of Batman in order to beat the crazy man. About Alan Moore: Alan Moore is an English author and is famous for his comic books work. He has penned down books like Alan Moore's Another Suburban Romance, Promethea - Book 02 of the Groundbreaking New Series and The League of Extraordinary Gentlemen Volume III: Century #3 2009.",
            "Publication_Year": "2008",
            "Author": "Alan Moore",
            "Age_Group": "",
            "Language": "English"
        },

        {
            "Image": "assets/images/ant-man-zombie.jpeg",
            "BookId": "13",
            "Stock": "In-Stock",
            "Title": "Ant-Man: Zombie Repellent",
            "Old_Price": "250",
            "New_Price": "165",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "Scott Lang, AKA Ant-Man, might be the smalles Super Hero, but he has the biggest heart. At times, though, he doubts how 'super' his super power really is when compared to Thor's mighty hammer, Hulk's incredible strength, and Iron Man's fancy, high-tech equipment.",
            "Long_description": "Scott Lang, AKA Ant-Man, might be the smalles Super Hero, but he has the biggest heart. At times, though, he doubts how 'super' his super power really is when compared to Thor's mighty hammer, Hulk's incredible strength, and Iron Man's fancy, high-tech equipment. Although Scott is not impressed with his talents, he eventually learns to value his skills rather than take them for granted, because no matter how big or small his help is, his teammates always appreciate when Ant-Man gets the job done.",
            "Publication_Year": "2015",
            "Author": "Bilal",
            "Age_Group": "",
            "Language": "English"
        },

        {
            "Image": "assets/images/asterix.jpeg",
            "BookId": "14",
            "Stock": "In-Stock",
            "Title": "Asterix And The Falling Sky",
            "Old_Price": "473",
            "New_Price": "374",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "All Gaul belongs to Caesar, but wait, there's still one tiny village which holds out, and old Julius has his hands full with it. In this graphic novel by Albert Uderzo, our friends from the little Gaulish village find that dear old Julius isn't the only one who wants to control all of Gaul.",
            "Long_description": "All Gaul belongs to Caesar, but wait, there's still one tiny village which holds out, and old Julius has his hands full with it. In this graphic novel by Albert Uderzo, our friends from the little Gaulish village find that dear old Julius isn't the only one who wants to control all of Gaul. If anything, their worst enemies might come from the sky! And as all Gauls know, there is only one thing to fear, discover the terrors and laughter of this new adventure in Asterix and The Falling Sky. Summary of the Book: Two alien spacecraft appear in the skies above the Gaulish village, and try to get control over the Gauls' secret magic potion. Asterix and Obelix return from another boar hunt, only to discover that all their friends have been turned rigid, well except for old druid Getafix who was testing the magic potion. Asterix is immune too, since he had just had some magic potion during the hunt and Obelix who was lucky, or unlucky, enough to have fallen into a vat full of the potion as a baby, admits that he has been feeding Dogmatix some potion on the side. When an alien comes to the village to confiscate the great weapon which has become famous throughout the universe, he discovers that the potion is incompatible with anyone but humans and enlarges him to gigantic size when he drinks it. How will Asterix and Obelix get out of this problem? Find out in this new Asterix title from Albert Uderzo.",
            "Publication_Year": "2006",
            "Author": "Rene Goscinny Albert Uderzo",
            "Age_Group": "",
            "Language": "English"
        },

        {
            "Image": "assets/images/the-avengers.jpeg",
            "BookId": "15",
            "Stock": "In-Stock",
            "Title": "The Avengers - Battle Against Loki",
            "Old_Price": "125",
            "New_Price": "80",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "The Asgardian Trickster versus The Avengers! Thors wicked brother Loki has come to earth to steal the ultimate power source the Tesseract.",
            "Long_description": "The Asgardian Trickster versus The Avengers! Thors wicked brother Loki has come to earth to steal the ultimate power source the Tesseract. With it, the vile villain plans to rule the earth. Unless The Avengers can stop him first.",
            "Publication_Year": "2015",
            "Author": "Tomas Palacios",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/green-arrow-vol-5.jpeg",
            "BookId": "16",
            "Stock": "In-Stock",
            "Title": "Green Arrow Vol. 5: The Outsiders War",
            "Old_Price": "999",
            "New_Price": "749",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "Oliver Queen thought he had it all figured out. As the heroic archer Green Arrow, he'd finally found a sense of purpose, friends to aid him, even a place on the Justice League of America. ",
            "Long_description": "Oliver Queen thought he had it all figured out. As the heroic archer Green Arrow, he'd finally found a sense of purpose, friends to aid him, even a place on the Justice League of America. But now, he's not even sure where he came from... or who he came from. As Green Arrow discovers that his stranding on a desert island was more than just an accident, there seem to be more sinister forces at work behind all these sudden revelations. The Queen family is embroiled in a war generations old. A war of clans.  A war of outsiders. Acclaimed creative team Jeff Lemire (ANIMAL MAN) and Andrea Sorrentino (I, VAMPIRE) take Green Arrow on his most challenging adventure yet. Collects issues #25-31.",
            "Publication_Year": "2014",
            "Author": "Jeff Lemire",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/batman-year-one.jpeg",
            "BookId": "17",
            "Stock": "In-Stock",
            "Title": "Batman: Year One",
            "Old_Price": "899",
            "New_Price": "658",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "Revisit the legend of the Dark Knight in Frank Miller and David Mazzucchelli’s most famous graphic novel, Batman: Year One.",
            "Long_description": "Revisit the legend of the Dark Knight in Frank Miller and David Mazzucchelli’s most famous graphic novel, Batman: Year One. Summary of the Book Gotham City is a dark criminal nest. Crime is rampant in the city, and the mob bosses control everything. No one is safe. Not even the richest and most powerful people. James Gordon is worried. He moves to Gotham with his wife Barbara after a transfer from Chicago to join the Gotham City Police Department. He quickly realizes Gotham is in a whole different league. The rules are very different, and even the cops cannot be trusted. Jim Gordon is far from dirty and will do anything to stick to his morals. He thinks he is alone in his crusade against the criminal scum of Gotham. He is wrong. A billionaire heir returns to the city after 12 years abroad. He has spent the years after his parents’ brutal murder in training, preparing for the war he was about to begin. As James Gordon becomes a minor celebrity for his bravery, the city turns its attentions towards a new terror. Many people spot the creature, it is swathed in black and looks like a giant bat. The creature hunts down the criminal lowlifes of Gotham, working its way up the crime ladder. It doesn’t appear human; it is a thing of the night, a silent protector, a watchful guardian. It calls itself Batman, and criminals are scared for their lives. However, James Gordon isn’t impressed. He doesn’t trust vigilantes, and it doesn’t matter whose side they are on. But who really is the mysterious Batman, and what is the reason for his one man assault against crime? About the Authors: Frank Miller is an American comic book writer, artist and film director. He is best associated with his graphic novels, including The Dark Knight Returns, The Dark Knight Strikes Again, Ronin, Daredevil: Born Again, Sin City and 300. David John Mazzucchelli is an American comic book writer and artist. He is best recognized for his work on Daredevil: Born Again, Asterios Polyp and City of Glass: The Graphic Novel. Frank MillerBatman: Year One was adapted into an animated film by DC Universe Animated Original Movies. The graphic novel also influenced several portions of Christopher Nolan’s adaptations: Batman Begins and The Dark Knight starring Christian Bale as Batman.",
            "Publication_Year": "2007",
            "Author": "Frank Miller",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/injustice-gods-among-us-vol-2.jpeg",
            "BookId": "18",
            "Stock": "In-Stock",
            "Title": "Injustice: Gods Among Us Vol. 2 ",
            "Old_Price": "1199",
            "New_Price": "899",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "",
            "Long_description": "",
            "Publication_Year": "2014",
            "Author": "Tom Taylor",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/blackest-night.jpeg",
            "BookId": "19",
            "Stock": "In-Stock",
            "Title": "Blackest Night",
            "Old_Price": "1199",
            "New_Price": "899",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "",
            "Long_description": "",
            "Publication_Year": "2015",
            "Author": "Johans",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/the-avengers-the-s-h-i-e-l-d.jpeg",
            "BookId": "20",
            "Stock": "In-Stock",
            "Title": "The Avengers - The S.H.I.E.L.D. Files",
            "Old_Price": "175",
            "New_Price": "135",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "Welcome to The Avengers Initiative S.H.I.E.L.D. Director Nick Fury has brought together earth's mightiest heroes to form The Avengers. ",
            "Long_description": "Welcome to The Avengers Initiative S.H.I.E.L.D. Director Nick Fury has brought together earth's mightiest heroes to form The Avengers. These are the top secret S.H.I.E.L.D. files on Captain America, Iron Man, Thor, Hulk, Hawkeye and Black Widow. But what kind of threat would cause Fury to call six super heroes and not just one?",
            "Publication_Year": "2015",
            "Author": "Scott Peterson",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/asterix-the-legionary.jpeg",
            "BookId": "21",
            "Stock": "In-Stock",
            "Title": "Asterix The Legionary",
            "Old_Price": "499",
            "New_Price": "352",
            "Category": "Comics and Graphic Novels Books",
            "Short_description": "Obelix falls in love! But the girl of his dreams is in love with another, who is imprisoned in North Africa while on an expedition in the Roman Army. ",
            "Long_description": "Obelix falls in love! But the girl of his dreams is in love with another, who is imprisoned in North Africa while on an expedition in the Roman Army. Can Asterix and Obelix find him and return him to her arms? Find out in Asterix the Legionary, the 10th book in the hilarious graphic novel series. Summary of the Book Ah, Love! It is such an irresistible force. Especially when it hits something as immovable as Obelix the Gaul. Poor Obelix’s superhuman body can’t resist love, especially when it’s in full bloom. When the beautiful Panacea returns to the little Gaulish village that refuses to lay down its arms on old Julius Caesar’s feet, she’s winning everyone’s hearts. Especially that of the well-fed and completely-not-obese Obelix who looks absolutely slim in his vertical stripes trousers. However, Panacea’s heart belongs to another: the brave and dashing Tragicomix. Obelix is heart-broken, which is saying something for a magic potion-emboldened heart. However, he has little time to let this go to his head, because Tragicomix is trapped in Africa, along with other Roman conscripts in his cohort. Someone needs to go to Africa and get him back. But there’s only one way to get to Africa safely: by sea. And the only ships that travel that far are Roman vessels, and the only ones who can board them are legionaries. Thankfully, Obelix’s friend Asterix has a plan. And naturally, it is a crazy one.",
            "Publication_Year": "2004",
            "Author": "Albert Uderzo",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/india-2020.jpeg",
            "BookId": "22",
            "Stock": "In-Stock",
            "Title": "India 2020",
            "Old_Price": "399",
            "New_Price": "243",
            "Category": "Literature & Fiction Books",
            "Short_description": "India 2020: A Vision for the Millennium, by A. P. J. Abdul Kalam and Y. S. Rajan, is a book that discusses the strengths and weaknesses of India, and offers a pragmatic vision of how the country can emerge as one of the foremost economic powers of the world.",
            "Long_description": "Former President of India, Dr. Kalam, penned this book with Y. S. Rajan, before his tenure as the President. It is dedicated to a young girl who had once shared her dream of living in a developed India. The book proposes a realistic plan of action to develop India into a powerful nation by 2020, based on the immense reservoir of knowledge, human resource and nuclear energy that the country possesses. Spread across 12 chapters, the book also offers readers a glimpse of the author’s genius and his ideas, which can help India in evolving as a superpower in the near future.",
            "Publication_Year": "2014",
            "Author": "A. P. J. Abdul Kalam",
            "Age_Group": "",
            "Language": "English"
        },

        {
            "Image": "assets/images/the-inheritance.jpeg",
            "BookId": "23",
            "Stock": "In-Stock",
            "Title": "The Inheritance of Loss",
            "Old_Price": "399",
            "New_Price": "234",
            "Category": "Literature & Fiction Books",
            "Short_description": "In a crumbling, isolated house at the foot of Mount Kanchenjunga in the Himalayas lives an embittered judge who wants only to retire in peace, when his orphaned granddaughter, Sai, arrives on his doorstep. The judge's cook watches over her distractedly, for his thoughts are often on his son, Biju, who is hopscotching from one gritty New York restaurant to another. ",
            "Long_description": "In a crumbling, isolated house at the foot of Mount Kanchenjunga in the Himalayas lives an embittered judge who wants only to retire in peace, when his orphaned granddaughter, Sai, arrives on his doorstep. The judge's cook watches over her distractedly, for his thoughts are often on his son, Biju, who is hopscotching from one gritty New York restaurant to another. Kiran Desai's brilliant novel, published to huge acclaim, is a story of joy and despair. Her characters face numerous choices that majestically illuminate the consequences of colonialism as it collides with the modern world. About the Author :- Kiran Desai was born in India in 1971. Her last book was the critically acclaimed Hullabaloo in the Guava Orchard. Educated in India, England and the United States, she continues to divide her time between places, with mixed results.",
            "Publication_Year": "2015",
            "Author": "Kiran Desai",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/the-secret-of-the-nagas.jpeg",
            "BookId": "24",
            "Stock": "In-Stock",
            "Title": "The Secret of the Nagas",
            "Old_Price": "275",
            "New_Price": "176",
            "Category": "Literature & Fiction Books",
            "Short_description": "The Secret of The Nagas is the second book in the Shiva trilogy and is a sequel to The Immortals of Meluha.",
            "Long_description": "The Secret of the Nagas begins with Shiva trying to save Sati from a Naga attack. His quest for the Naga warrior who killed Brahaspati and assaulted Sati leads Shiva and Sati to the land of the Brangas. In The Secret of Nagas, Shiva the prophesied savior of the Meluhan Empire finds himself in a turbulent situation trying to avenge the murder of his friend and saving his clan and the people of Meluha from the evil serpent people. His journey takes him across the lengths and breadths of the ancient India, searching for the truth and answers to all his intriguing questions. He travels to Kashi to find every bit of detail about the Nagas. He comes to learn about the reason behind the alliance between the Brangas and the Nagas. Both Shiva and Sati eventually discover startling secrets that have profound effects on both their lives and relationship. With a war brewing in the backdrop, will Shiva be able to accept the truth and live up to the expectations attached to him?",
            "Publication_Year": "2011",
            "Author": "Amish Tripathi",
            "Age_Group": "",
            "Language": "English"
        },

        {
            "Image": "assets/images/half-girlfriend-hindi.jpeg",
            "BookId": "25",
            "Stock": "In-Stock",
            "Title": "HALF GIRLFRIEND (HINDI)",
            "Old_Price": "176",
            "New_Price": "102",
            "Category": "Literature & Fiction Books",
            "Short_description": "This is the Hindi version of Chetan Bhagat’s new novel, Half Girlfriend. It examines the less talked about dimensions of relationships in the contemporary world.",
            "Long_description": "Madhav, a Bihari boy with big dreams, falls in love with the gorgeous girl, Riya. Riya comes from a rich family from Delhi. None of their interests match with each other’s. His English is not really good while she speaks the best English. He wants her to be his lover, but Riya doesn’t want to be anything other than friends. When it is simply not working out, Riya comes up with an idea, or rather, a compromise – she becomes his half-girlfriend!",
            "Publication_Year": "2015",
            "Author": "CHETAN BHAGAT",
            "Age_Group": "",
            "Language": "Hindi"
        },

        {
            "Image": "assets/images/revolution-twenty20.jpeg",
            "BookId": "26",
            "Stock": "In-Stock",
            "Title": "Revolution Twenty20",
            "Old_Price": "176",
            "New_Price": "105",
            "Category": "Literature & Fiction Books",
            "Short_description": "Revolution Twenty20 is an extraordinary tale of friendship, ambition, corruption and unrequited love by India’s bestselling author, Chetan Bhagat.",
            "Long_description": "In Revolution Twenty20, Chetan Bhagat explores the lives of three close friends from Varanasi, set against the backdrop of India’s corrupt political system. Gopal and Raghav are the best of friends. Although they hail from completely different family backgrounds they share a common passion for success and realizing their dreams in life. Gopal’s family has been caught up in a never-ending property dispute and he aspires to come out the mess and amass a lot of wealth, Raghav, on the other hand, desires to bring about a revolution in the system and do something significant for the society. Their lives take a surprising turn when both of them fall in love with their mutual friend, Aarti. Gopal gives in to the corrupt system but Raghav tries to set things right. This situation turns the friends against each other. Will Raghav be successful in bringing about a social change or will he succumb to his desires like Gopal? Who will Aarti choose to spend the rest of her life with? Revolution Twenty20 will make for a riveting read for all Chetan Bhagat fans.",
            "Publication_Year": "2014",
            "Author": "Chetan Bhagat",
            "Age_Group": "",
            "Language": "English"
        },

        {
            "Image": "assets/images/the-3-mistakes-of-my-life.jpeg",
            "BookId": "27",
            "Stock": "In-Stock",
            "Title": "The 3 Mistakes of My Life",
            "Old_Price": "176",
            "New_Price": "102",
            "Category": "Literature & Fiction Books",
            "Short_description": "The 3 Mistakes of My Life is a heartwarming story of friendship, love, passion and ambition by Chetan Bhagat, bestselling author of Five Point Someone.",
            "Long_description": "The 3 Mistakes of My Life traces the lives of three close friends, Govind, Omi and Ishan, in Gujarat. It chronicles the delightful and tragic tale of these young men as they embark on a journey to find success in their lives and careers. Govind has forever cherished a dream of setting up his own business, while Omi and Ishaan have always been relatively laid back in life. Together they start a cricket shop. Instead of focusing on the business, Ishaan aspires to mentor a gifted batsman, Ali. Omi, on the other hand, is not very opportunistic and ambitious and his only aim in life is to be there for his friends and support them in all their endeavors. However, nothing comes easy in life especially when you are stuck in a city which is caught up in chaos and turmoil. To realize their dreams, the boys have to face the worst of the circumstances – communal riots, massive earthquake, religious politics, and above all they have to bear the brunt of all their mistakes. Will the boys be able to come out triumphant from this messy situation? Three Mistakes of My Life was adapted into a movie called Kai Po Che! which was directed by Abhishek Kapoor.",
            "Publication_Year": "2015",
            "Author": "Chetan Bhagat",
            "Age_Group": "",
            "Language": "English"
        },

        {
            "Image": "assets/images/unposted-letter.jpeg",
            "BookId": "28",
            "Stock": "In-Stock",
            "Title": "UNPOSTED LETTER",
            "Old_Price": "250",
            "New_Price": "175",
            "Category": "Literature & Fiction Books",
            "Short_description": "The rise and fall of every human being has its effect on the overall human consciousness. Every lesson learn, every mistake committed, every error corrected, every discovery, every invention, every insight, every idea, every revelation, every talent unfolded, every limit redefined, every thought released, every vibration experienced by every individual paints yet another stroke in the evolution of human consciousness.",
            "Long_description": "When a man lives his life with heightened awareness, his life helps humanity to gain a few years of maturity without having to live those few years. In effect, he fast-forwards humanity by a few years. Every being who is living his life with heightened awareness is actually doing God's work he has been delegated a responsibility by Existence to play a part in evolving human consciousness To play a role in evolving human consciousness, T.T.Rangarajan founded Alma Mater on February 14, 1995. Today, hundreds of organizations and hundreds of thousands of people would vouch for the turnaround Alma Mater has created in their lives. Being an impassioned propagator of value-based living and holistic development, T.T. Rangarajan's vision of lifting humanity to a higher level of spiritual consciousness is carried through by his experiential workshops, residential spiritual retreats and his brainchild - the growth oriented magazine Frozen Thoughts.",
            "Publication_Year": "2011",
            "Author": "Rajan",
            "Age_Group": "",
            "Language": "Tamil"
        },

        {
            "Image": "assets/images/quantitative-aptitude.jpeg",
            "BookId": "29",
            "Stock": "In-Stock",
            "Title": "Quantitative Aptitude 5th Edition",
            "Old_Price": "595",
            "New_Price": "385",
            "Category": "General Preparation & Personality development",
            "Short_description": "Quantitative Aptitude for Competitive Examinations is a comprehensive book for candidates preparing for various competitive examinations. ",
            "Long_description": "Quantitative Aptitude for Competitive Examinations is a comprehensive book for candidates preparing for various competitive examinations. The book comprises of chapters on number system, HCF and LCM, fractions and decimals, percentage, profit and loss, ratio and proportion, time, work and wages, time and distance, linear equations, geometry and trigonometry. In addition, the book consists of several solved and unsolved questions and model test papers for thorough revision and final practice. This book is essential for candidates appearing for exams like IBPS PO, Railway Recruitment examination, CTET, MAT and GRE.",
            "Publication_Year": "2014",
            "Author": "Abhijit Guha",
            "Age_Group": "",
            "Language": "English"

        }, {
            "Image": "assets/images/quantitative-aptitude_1.jpeg",
            "BookId": "30",
            "Stock": "In-Stock",
            "Title": "QUANTITATIVE APTITUDE",
            "Old_Price": "350",
            "New_Price": "300",
            "Category": "General Preparation & Personality development",
            "Short_description": "1. A practical, concise and yet a comprehensive book 2. Based on the trends of previous years' exams 3. Also Included : a. MCQs & their Answers b. Basic description of theorems along with solved examples c. ",
            "Long_description": "Explanatory notes for difficult problems d. Exercises graded based on level of complexity Contents: Number System HCF and LCM Decimal Fractions Simplification Square Roots and Cube Roots Average Problems on Numbers Problems on Ages Percentage Profit and Loss Ratio and Proportion Partnership Chain Rule Time and Work Pipes and Cisterns Time and Distance Problems on Trains Boats and Streams Alligation or Mixture Simple Interest Compound Interest Work and Wage Probability Geometry: Lines, Triangles,Quadrilaterals and Circles Area and Perimeter Volume and Surface Area Statistics Data Analysis Trigonometry Algebra Logarithms",
            "Publication_Year": "2015",
            "Author": "",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/math-iq-challenge.jpeg",
            "BookId": "31",
            "Stock": "In-Stock",
            "Title": "Math IQ Challenge",
            "Old_Price": "150",
            "New_Price": "119",
            "Category": "General Preparation & Personality development",
            "Short_description": "Math IQ Challenge, published by MTG Learning Media, is a comprehensive book that contains 51 Aptitude tests. It is essential for those who aspire to excel in National Science Olympiad, National Cyber Olympiad, and International Mathematics Olympiad, organized by Science Olympiad Foundation.",
            "Long_description": "Math IQ Challenge, published by MTG Learning Media, is a comprehensive book that contains 51 Aptitude tests. It is essential for those who aspire to excel in National Science Olympiad, National Cyber Olympiad, and International Mathematics Olympiad, organized by Science Olympiad Foundation. The book is also useful for those who are preparing for CAT, CET, MCA, GRE, and SAT among several other competitive exams.",
            "Publication_Year": "2014",
            "Author": "Anil Ahlawat",
            "Age_Group": "",
            "Language": "English"

        }, {
            "Image": "assets/images/bank-po.jpeg",
            "BookId": "32",
            "Stock": "In-Stock",
            "Title": "Bank PO Quantitative Aptitude",
            "Old_Price": "375",
            "New_Price": "325",
            "Category": "General Preparation & Personality development",
            "Short_description": "Chapterwise Solved Papers 1999 - Till Date (3940+ Objective Questions Of Nationalised Banks,Gramin Bank,IBPS PO/MT/SO,RRBs Officer,SBI,RBI Grade B & Insurance AAO , AO)",
            "Long_description": "Chapterwise Solved Papers 1999 - Till Date (3940+ Objective Questions Of Nationalised Banks,Gramin Bank,IBPS PO/MT/SO,RRBs Officer,SBI,RBI Grade B & Insurance AAO , AO)",
            "Publication_Year": "2011",
            "Author": "",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/gate-guide-life-science.jpeg",
            "BookId": "33",
            "Stock": "In-Stock",
            "Title": "Gate Guide",
            "Old_Price": "595",
            "New_Price": "355",
            "Category": "General Preparation & Personality development",
            "Short_description": "Life Science Chemistry & General Aptitude",
            "Long_description": "Life Science Chemistry & General Aptitude",
            "Publication_Year": "2016",
            "Author": "",
            "Age_Group": "",
            "Language": "English"
        }, {
            "Image": "assets/images/the-pearson-csat.jpeg",
            "BookId": "34",
            "Stock": "In-Stock",
            "Title": "The Pearson CSAT Manual 2013",
            "Old_Price": "1290",
            "New_Price": "1110",
            "Category": "General Preparation & Personality development",
            "Short_description": "UPSC Civil Services Aptitude Test for the UPSC Civil Services Examination",
            "Long_description": "UPSC Civil Services Aptitude Test for the UPSC Civil Services Examination",
            "Publication_Year": "2013",
            "Author": "Alexander",
            "Age_Group": "",
            "Language": "English"
        },

    ];

});


var ESCategoryServices = angular.module('ESCategoryServices', ['ngResource']);
ESCategoryServices.factory('CategoryServices', ['$resource', function($resource) {
    return {
        appCategory: $resource('assets/jsons/:categoryId.json', {}, {
            query: {
                isArray: false
            }
        })
    }
}]);

ESCategoryServices.factory('DetailServices', ['$resource', function($resource) {
    return {
        appdetail: $resource('', {}, {
            query: {
                isArray: false
            }
        })
    }
}]);