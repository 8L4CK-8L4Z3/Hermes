import { errorResponse } from "../Utils/responses.js";
import Trip from "../Models/Trip.js";
import Destination from "../Models/Destination.js";
export const checkTripOwnership = async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);
  if (!trip) return next(new errorResponse("Trip not found", 404));
  if (trip.user_id.toString() !== req.user.id) {
    return next(
      new errorResponse("You are not authorized to access this trip", 403)
    );
  }
  next();
};

export const checkDestinationOwnership = async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);
  if (!trip) return next(new errorResponse("Trip not found", 404));

  if (trip.user_id.toString() !== req.user.id) {
    return next(
      new errorResponse(
        "You are not authorized to access this destination",
        403
      )
    );
  }

  const destination = await Destination.findById(req.params.destinationId);
  if (!destination)
    return next(new errorResponse("Destination not found", 404));
  if (destination.trip_id.toString() !== req.params.tripId) {
    return next(
      new errorResponse(
        "You are not authorized to access this destination",
        403
      )
    );
  }
  next();
};
