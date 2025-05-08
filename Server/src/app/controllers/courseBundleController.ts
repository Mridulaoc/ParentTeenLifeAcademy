import { Request, Response } from "express";

import { CourseBundleRepository } from "../../domain/repositories/courseBundleRepository";
import { FetchAllCoursesUseCase } from "../../domain/usecases/fetchAllCoursesUseCase";
import { AddBundleUseCase } from "../../domain/usecases/addBundleUseCase";
import { FetchBundlesUseCase } from "../../domain/usecases/fetchBundleUseCase";
import { DeleteBundleUseCase } from "../../domain/usecases/deleteBundleUseCase";
import { FetchBundleDetailsUseCase } from "../../domain/usecases/fetchBundleDetailsUseCase";
import { UpdateBundleUseCase } from "../../domain/usecases/updateBundleUseCase";

const courseBundleRepository = new CourseBundleRepository();
const fetchAllCoursesUseCase = new FetchAllCoursesUseCase(
  courseBundleRepository
);
const addBundleUsecase = new AddBundleUseCase(courseBundleRepository);
const fetchBundleUseCase = new FetchBundlesUseCase(courseBundleRepository);
const deleteBundleUseCase = new DeleteBundleUseCase(courseBundleRepository);
const fetchBundleDetailsUseCase = new FetchBundleDetailsUseCase(
  courseBundleRepository
);
const updateBundleUseCase = new UpdateBundleUseCase(courseBundleRepository);

export const fetchAllCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await fetchAllCoursesUseCase.execute();

    res.status(200).json(courses);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A bundle with same name already exists."
    ) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error adding basic details" });
  }
};

export const addNewBundle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await addBundleUsecase.execute(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A Bundle with the same name already exists."
    ) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error adding bundle" });
  }
};

export const fetchAllBundles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const { search, category, sort } = req.query;
    const { bundles, total } = await fetchBundleUseCase.execute(
      page,
      limit,
      search as string,
      category as string,
      sort as string
    );
    res.status(200).json({ bundles, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bundles" });
  }
};

export const deleteBundle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bundleId = req.params.bundleId;
    const result = await deleteBundleUseCase.execute(bundleId);
    if (!result.success) {
      res.status(404).json({ message: result.message });
      return;
    }
    res.status(200).json({ messsage: result.message });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to delete the bundle",
    });
  }
};

export const getBundleDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bundleId = req.params.bundleId;
    if (!bundleId) {
      throw new Error("Bundle ID not found");
    }
    const bundle = await fetchBundleDetailsUseCase.execute(bundleId);
    if (!bundle) {
      throw new Error("Bundle not found");
    }
    res.status(200).json(bundle);
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const updateBundle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bundleId = req.params.bundleId;
    const bundleData = req.body;

    const updatedBundle = await updateBundleUseCase.execute(
      bundleId,
      bundleData
    );

    res.status(200).json({
      message: "Course updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};
