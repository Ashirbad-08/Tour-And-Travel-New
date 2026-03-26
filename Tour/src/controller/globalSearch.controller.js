import Package from "../model/package.model.js";
import Guide from "../model/guide.model.js";
import Booking from "../model/bookings.js";

export const globalSearch = async (req, res) => {
  try {
    const q = req.query.q;
    const userId = req.user?.id || null;

    // alidation
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
        data: null
      });
    }

    const regex = new RegExp(q, "i");

  //-------- PUBLIC SEARCH -------- //
    const [packages, guides] = await Promise.all([
      Package.find({
        $or: [
          { title: regex },
          { description: regex },
          { location: regex }
        ]
      }).limit(10),

      Guide.find({
        $or: [
          { name: regex },
          { specialization: regex }
        ]
      }).limit(10)
    ]);

  //-------- PRIVATE SEARCH (BOOKINGS) -------- //
    let bookings = [];

    if (userId) {
      bookings = await Booking.find({
        user: userId,
        $or: [
          { bookingCode: regex },
          { travelerName: regex }
        ]
      }).limit(10);
    }

    return res.json({
      success: true,
      query: q,
      data: {
        packages,
        guides,
        bookings
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const searchSuggestions = async (req, res) => {
  try {
    const q = req.query.q;
    const userId = req.user?.id || null;

    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        data: []
      });
    }

    const regex = new RegExp(`^${q}`, "i"); // starts-with match

    const suggestions = [];

    // 📦 Package suggestions
    const packages = await Package.find({
      $or: [
        { title: regex },
        { location: regex }
      ]
    })
      .select("title location")
      .limit(5);

    packages.forEach(pkg => {
      suggestions.push({
        type: "package",
        value: pkg.title
      });
    });

    // 🧑‍💼 Guide suggestions
    const guides = await Guide.find({
      name: regex
    })
      .select("name")
      .limit(5);

    guides.forEach(guide => {
      suggestions.push({
        type: "guide",
        value: guide.name
      });
    });

    // 📄 Booking suggestions (PRIVATE)
    if (userId) {
      const bookings = await Booking.find({
        user: userId,
        bookingCode: regex
      })
        .select("bookingCode")
        .limit(5);

      bookings.forEach(b => {
        suggestions.push({
          type: "booking",
          value: b.bookingCode
        });
      });
    }

    return res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
